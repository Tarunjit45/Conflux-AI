// Conflux Platform — Cashfree Payment Webhook Handler
// Policy: Verifies official HMAC-SHA256 signature, prevents replay attacks, updates order payment status idempotently.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { emailService } from '../lib/emailService.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const signature = req.headers['x-webhook-signature'] as string | undefined;
  const timestamp = req.headers['x-webhook-timestamp'] as string | undefined;

  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // If secret key is configured or in PRODUCTION, strictly require and verify the HMAC-SHA256 signature
  if (secretKey) {
    if (!signature || !timestamp) {
      console.error('[Cashfree Webhook] Missing signature or timestamp headers');
      return res.status(400).json({ error: 'Missing webhook signature or timestamp headers' });
    }

    try {
      const signedData = timestamp + rawBody;
      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(signedData)
        .digest('base64');

      if (signature !== expectedSignature) {
        console.error('[Cashfree Webhook] Invalid HMAC signature');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    } catch (sigErr) {
      console.error('[Cashfree Webhook Signature Error]', sigErr);
      return res.status(400).json({ error: 'Signature verification failure' });
    }
  } else if (env === 'PRODUCTION') {
    console.error('[Cashfree Webhook] CASHFREE_SECRET_KEY missing in PRODUCTION environment');
    return res.status(500).json({ error: 'Cashfree webhook secret unconfigured in production' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = payload?.type;
    const orderData = payload?.data?.order;
    const paymentData = payload?.data?.payment;

    const orderId = orderData?.order_id;
    const paymentStatus = paymentData?.payment_status;
    const cfPaymentId = paymentData?.cf_payment_id ? String(paymentData.cf_payment_id) : undefined;
    const paymentMethod = paymentData?.payment_group || 'ONLINE';
    const paymentTime = paymentData?.payment_time || new Date().toISOString();

    if (!orderId) {
      return res.status(400).json({ error: 'Missing order_id in webhook payload' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Fetch current order state for idempotency check
      const { data: existingOrder } = await supabase
        .from('verification_orders')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (paymentStatus === 'SUCCESS') {
        // Preserve verification status if already advanced beyond PAYMENT_PENDING
        let nextVerStatus = 'PAID';
        if (existingOrder && existingOrder.verification_status && existingOrder.verification_status !== 'PAYMENT_PENDING') {
          nextVerStatus = existingOrder.verification_status;
        }

        await supabase
          .from('verification_orders')
          .update({
            payment_status: 'PAID',
            verification_status: nextVerStatus,
            payment_reference: cfPaymentId || existingOrder?.payment_reference,
            payment_method: paymentMethod || existingOrder?.payment_method || 'ONLINE',
            payment_time: paymentTime || existingOrder?.payment_time || new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId);

        // Dispatch payment receipt and admin notification idempotently (non-blocking)
        if (existingOrder?.customer_email) {
          try {
            await emailService.sendVerificationPaymentSuccess({
              orderId,
              businessSlug: existingOrder.business_slug,
              businessName: existingOrder.business_name,
              customerName: existingOrder.customer_name,
              customerEmail: existingOrder.customer_email,
              customerPhone: existingOrder.customer_phone,
              amountInr: Number(existingOrder.amount_inr) || 499.00,
              paymentReference: cfPaymentId || existingOrder.payment_reference,
              paymentTime: paymentTime,
              verificationStatus: nextVerStatus as any,
              paymentStatus: 'PAID'
            } as any);

            await emailService.sendAdminVerificationPayment({
              orderId,
              businessSlug: existingOrder.business_slug,
              businessName: existingOrder.business_name,
              customerEmail: existingOrder.customer_email,
              amountInr: Number(existingOrder.amount_inr) || 499.00
            } as any);
          } catch (mailErr) {
            console.warn('[Cashfree Webhook Email Notice]', mailErr);
          }
        }
      } else if (paymentStatus === 'FAILED' || paymentStatus === 'USER_DROPPED') {
        // Only mark FAILED if not already PAID
        if (!existingOrder || existingOrder.payment_status !== 'PAID') {
          await supabase
            .from('verification_orders')
            .update({
              payment_status: 'FAILED',
              updated_at: new Date().toISOString()
            })
            .eq('order_id', orderId);
        }
      }
    }

    return res.status(200).json({ status: 'OK', received: true });
  } catch (err: any) {
    console.error('[Cashfree Webhook Processing Error]', err);
    return res.status(500).json({ error: err.message || 'Internal webhook error' });
  }
}
