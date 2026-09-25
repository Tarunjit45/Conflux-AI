// Conflux Platform — Centralized Transactional Email Dispatch Endpoint
// Core Invariant: Server-side credentials only; strict idempotency; non-blocking safe delivery.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { compileEmailTemplate } from '../lib/emailTemplates.js';
import type { EmailEventType, EmailLog, EmailSendResult, EmailCategory, EmailDeliveryStatus } from '../types/email.js';

// CORS Headers helper
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      eventType,
      recipient,
      recipientName,
      entityId,
      idempotencyKey,
      category = 'TRANSACTIONAL',
      data = {}
    } = body as {
      eventType: EmailEventType;
      recipient: string;
      recipientName?: string;
      entityId?: string;
      idempotencyKey?: string;
      category?: EmailCategory;
      data?: Record<string, any>;
    };

    if (!eventType || !recipient) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: eventType and recipient are mandatory.'
      });
    }

    const cleanRecipient = String(recipient).trim().toLowerCase();
    const cleanIdempotencyKey = idempotencyKey || `${eventType}:${entityId || cleanRecipient}:${Date.now()}`;

    // 1. Supabase Client Setup
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

    // 2. Check Marketing Preferences (Transactional emails ALWAYS bypass preference checks)
    if (category === 'MARKETING' && supabase) {
      const { data: prefs } = await supabase
        .from('user_email_preferences')
        .select('allow_marketing')
        .eq('email', cleanRecipient)
        .maybeSingle();

      if (prefs && !prefs.allow_marketing) {
        return res.status(200).json({
          success: true,
          status: 'SKIPPED_PREFERENCE' as EmailDeliveryStatus,
          message: 'User opted out of marketing emails.'
        });
      }
    }

    // 3. Idempotency Check: Avoid duplicate email dispatch if already successfully sent
    if (supabase) {
      const { data: existingLog } = await supabase
        .from('email_logs')
        .select('*')
        .eq('idempotency_key', cleanIdempotencyKey)
        .maybeSingle();

      if (existingLog && ['SENT', 'SANDBOX'].includes(existingLog.status)) {
        return res.status(200).json({
          success: true,
          status: 'SKIPPED_DUPLICATE' as EmailDeliveryStatus,
          idempotencyKey: cleanIdempotencyKey,
          messageId: existingLog.provider_message_id,
          message: 'Email already dispatched for this idempotency key.'
        });
      }
    }

    // 4. Render Email Template
    const rendered = compileEmailTemplate(eventType, data);

    // 5. Environment & Provider Configuration
    const apiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY;
    const configuredProvider = (process.env.EMAIL_PROVIDER || 'resend').toLowerCase();
    const fromAddress = process.env.EMAIL_FROM || 'Conflux AI <no-reply@confluxai.in>';
    const replyTo = process.env.EMAIL_REPLY_TO || 'contact@confluxai.in';

    let sendResult: EmailSendResult = {
      success: false,
      status: 'FAILED',
      idempotencyKey: cleanIdempotencyKey,
      retryCount: 0
    };

    // 6. Provider Dispatch Logic
    if (configuredProvider === 'sandbox' || !apiKey) {
      // Sandbox / Development simulation mode
      console.log(`[Email Sandbox] Dispatched ${eventType} to ${cleanRecipient} (Subject: "${rendered.subject}")`);
      sendResult = {
        success: true,
        status: 'SANDBOX',
        messageId: `sbx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        idempotencyKey: cleanIdempotencyKey,
        retryCount: 0
      };
    } else {
      // Live Resend Provider with exponential backoff retry loop
      const resend = new Resend(apiKey);
      const MAX_RETRIES = 3;
      let attempt = 0;
      let lastError: any = null;

      while (attempt < MAX_RETRIES) {
        attempt++;
        try {
          const { data: resendData, error: resendError } = await resend.emails.send({
            from: fromAddress,
            to: [cleanRecipient],
            replyTo: replyTo,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text
          });

          if (resendError) {
            lastError = resendError;
            console.warn(`[Resend Attempt ${attempt}/${MAX_RETRIES} Failed]`, resendError);
            if (attempt < MAX_RETRIES) {
              await new Promise(r => setTimeout(r, attempt * 500));
            }
          } else if (resendData) {
            sendResult = {
              success: true,
              status: 'SENT',
              messageId: resendData.id,
              idempotencyKey: cleanIdempotencyKey,
              retryCount: attempt - 1
            };
            break;
          }
        } catch (callErr: any) {
          lastError = callErr;
          console.warn(`[Resend Network Exception Attempt ${attempt}/${MAX_RETRIES}]`, callErr);
          if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, attempt * 500));
          }
        }
      }

      if (!sendResult.success) {
        sendResult.error = lastError?.message || String(lastError || 'Resend delivery failed.');
        sendResult.retryCount = attempt;
      }
    }

    // 7. Audit Log in Supabase (Non-blocking)
    if (supabase) {
      try {
        await supabase.from('email_logs').upsert({
          event_type: eventType,
          recipient: cleanRecipient,
          subject: rendered.subject,
          entity_id: entityId || null,
          status: sendResult.status,
          provider: configuredProvider === 'sandbox' || !apiKey ? 'sandbox' : 'resend',
          provider_message_id: sendResult.messageId || null,
          idempotency_key: cleanIdempotencyKey,
          retry_count: sendResult.retryCount || 0,
          error_message: sendResult.error || null,
          category: category,
          updated_at: new Date().toISOString()
        }, { onConflict: 'idempotency_key' });
      } catch (logErr) {
        console.warn('[Email Audit Log Warning]', logErr);
      }
    }

    return res.status(200).json(sendResult);
  } catch (error: any) {
    console.error('[Central Email Handler Exception]', error);
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      error: error?.message || 'Internal server error in email handler'
    });
  }
}
