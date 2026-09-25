// Conflux Platform — Order Status & Payment Verification Endpoint
// Used upon user return from Cashfree hosted checkout to confirm order status immediately.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { order_id } = req.query as { order_id?: string };

  if (!order_id) {
    return res.status(400).json({ success: false, error: 'Missing order_id' });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();
  const apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';

  let isPaid = false;
  let cfPaymentId: string | undefined = undefined;

  // 1. Verify status with Cashfree API
  if (env === 'PRODUCTION') {
    if (!appId || !secretKey) {
      console.error('[Cashfree Verify] Production credentials missing');
      return res.status(500).json({ success: false, error: 'Cashfree production credentials unconfigured.' });
    }

    if (order_id.startsWith('cfx_verify_sandbox')) {
      return res.status(400).json({ success: false, error: 'Sandbox order IDs are not valid in PRODUCTION mode.' });
    }

    try {
      const cfRes = await fetch(`https://api.cashfree.com/pg/orders/${encodeURIComponent(order_id)}`, {
        method: 'GET',
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': apiVersion,
          'Content-Type': 'application/json'
        }
      });

      if (cfRes.ok) {
        const orderData = await cfRes.json();
        if (orderData.order_status === 'PAID') {
          isPaid = true;
          cfPaymentId = String(orderData.cf_order_id || '');
        }
      } else {
        const errText = await cfRes.text();
        console.warn('[Cashfree Production Status Check Error]', errText);
      }
    } catch (err) {
      console.error('[Cashfree Production Status Check Exception]', err);
    }
  } else {
    // Sandbox / Local fallback environment
    if (appId && secretKey && !order_id.startsWith('cfx_verify_sandbox')) {
      try {
        const cfRes = await fetch(`https://sandbox.cashfree.com/pg/orders/${encodeURIComponent(order_id)}`, {
          method: 'GET',
          headers: {
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'x-api-version': apiVersion,
            'Content-Type': 'application/json'
          }
        });

        if (cfRes.ok) {
          const orderData = await cfRes.json();
          if (orderData.order_status === 'PAID') {
            isPaid = true;
            cfPaymentId = String(orderData.cf_order_id || '');
          }
        }
      } catch (err) {
        console.warn('[Cashfree Sandbox Status Check Warning]', err);
      }
    } else {
      // Offline/Local simulation only for sandbox
      isPaid = true;
      cfPaymentId = `TEST_PAY_${Date.now()}`;
    }
  }

  // 2. Update Supabase if paid
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let orderRecord: any = null;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: existing } = await supabase
        .from('verification_orders')
        .select('*')
        .eq('order_id', order_id)
        .maybeSingle();

      if (isPaid) {
        const nextVerStatus = (existing && existing.verification_status && existing.verification_status !== 'PAYMENT_PENDING')
          ? existing.verification_status
          : 'PAID';

        const { data, error } = await supabase
          .from('verification_orders')
          .update({
            payment_status: 'PAID',
            verification_status: nextVerStatus,
            payment_reference: cfPaymentId || existing?.payment_reference,
            updated_at: new Date().toISOString()
          })
          .eq('order_id', order_id)
          .select()
          .maybeSingle();

        if (!error && data) {
          orderRecord = data;
        } else {
          orderRecord = existing;
        }
      } else {
        orderRecord = existing;
      }
    } catch (dbErr) {
      console.warn('[Database Query Warning]', dbErr);
    }
  }

  return res.status(200).json({
    success: true,
    orderId: order_id,
    isPaid,
    paymentReference: cfPaymentId,
    order: orderRecord
  });
}
