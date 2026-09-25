// Conflux Platform — Server-Side Cashfree Verification Order Creator
// Core Invariant: Secret credentials NEVER exposed to frontend; creates orders via official Cashfree PG API.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      businessId,
      businessSlug,
      businessName,
      customerName,
      customerEmail,
      customerPhone
    } = body || {};

    if (!businessName || !businessSlug) {
      return res.status(400).json({ success: false, error: 'Business name and slug are required.' });
    }
    if (!customerEmail || !customerEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid customer email is required.' });
    }

    const cleanPhone = (customerPhone || '9876543210').replace(/[^0-9]/g, '').slice(-10) || '9876543210';
    const orderId = `cfx_verify_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const amountInr = 499.00;

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();
    const apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';
    const appUrl = process.env.APP_URL || 'https://www.confluxai.in';

    // Strict Production Check: Do not generate mock orders in PRODUCTION mode
    if (env === 'PRODUCTION' && (!appId || !secretKey)) {
      console.error('[Cashfree Error] Missing production credentials in PRODUCTION mode');
      return res.status(500).json({
        success: false,
        error: 'Cashfree Payment Gateway production credentials are not configured.'
      });
    }

    // Check for existing orders in Supabase to prevent duplicate applications
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    let supabaseClient: any = null;

    if (supabaseUrl && supabaseKey) {
      try {
        supabaseClient = createClient(supabaseUrl, supabaseKey);

        // 1. Conflict Check: An application is already paid, under review, or verified
        const { data: activeOrders } = await supabaseClient
          .from('verification_orders')
          .select('order_id, verification_status, created_at')
          .eq('business_slug', businessSlug)
          .in('verification_status', ['PAID', 'UNDER_REVIEW', 'MORE_EVIDENCE_REQUIRED', 'VERIFIED'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (activeOrders && activeOrders.length > 0) {
          const active = activeOrders[0];
          return res.status(409).json({
            success: false,
            error: `An active verification application or verified badge is already in progress (${active.verification_status}) for this business.`,
            orderId: active.order_id,
            verificationStatus: active.verification_status
          });
        }

        // 2. Reuse Check: A pending checkout was initiated within the last 15 minutes
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const { data: recentPending } = await supabaseClient
          .from('verification_orders')
          .select('order_id, payment_session_id')
          .eq('business_slug', businessSlug)
          .eq('verification_status', 'PAYMENT_PENDING')
          .gte('created_at', fifteenMinsAgo)
          .order('created_at', { ascending: false })
          .limit(1);

        if (recentPending && recentPending.length > 0 && recentPending[0].payment_session_id) {
          return res.status(200).json({
            success: true,
            orderId: recentPending[0].order_id,
            paymentSessionId: recentPending[0].payment_session_id,
            amountInr: 499.00,
            environment: env === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX'
          });
        }
      } catch (dbCheckErr) {
        console.warn('[Database Order Check Warning]', dbCheckErr);
      }
    }

    let paymentSessionId = `session_sandbox_${orderId}`;
    let cfOrderId: string | undefined = undefined;

    // Call official Cashfree PG Orders API if credentials exist
    if (appId && secretKey) {
      const baseUrl = env === 'PRODUCTION'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';

      const cashfreePayload = {
        order_id: orderId,
        order_amount: amountInr,
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${cleanPhone}`,
          customer_name: customerName || 'Business Owner',
          customer_email: customerEmail,
          customer_phone: cleanPhone
        },
        order_meta: {
          return_url: `${appUrl}/verify/payment-return?order_id={order_id}`,
          notify_url: `${appUrl}/api/cashfree-webhook`
        },
        order_note: `Conflux Verified 1-Year Review Fee for ${businessName}`
      };

      const cfRes = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': apiVersion,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cashfreePayload)
      });

      if (!cfRes.ok) {
        const errText = await cfRes.text();
        console.error('[Cashfree Error]', errText);
        return res.status(502).json({
          success: false,
          error: `Cashfree order creation failed: ${errText}`
        });
      }

      const cfData = await cfRes.json();
      paymentSessionId = cfData.payment_session_id;
      cfOrderId = String(cfData.cf_order_id || '');
    }

    // Persist to Supabase if configured
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('verification_orders').insert([{
          order_id: orderId,
          cf_order_id: cfOrderId,
          business_id: businessId || null,
          business_slug: businessSlug,
          business_name: businessName,
          customer_name: customerName || 'Business Owner',
          customer_email: customerEmail,
          customer_phone: cleanPhone,
          amount_inr: amountInr,
          currency: 'INR',
          payment_status: 'PENDING',
          verification_status: 'PAYMENT_PENDING',
          payment_session_id: paymentSessionId
        }]);
      } catch (dbErr) {
        console.warn('[Database Insert Warning]', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      orderId,
      paymentSessionId,
      amountInr,
      environment: env === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX'
    });
  } catch (err: any) {
    console.error('[Create Verification Order Error]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal order creation error.'
    });
  }
}
