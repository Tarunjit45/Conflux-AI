// Conflux Platform — Inbound Lead Processing & Resend Email Delivery API

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Conflux Inquiries <inquiries@confluxai.in>';
const LEAD_NOTIFICATION_EMAIL = process.env.LEAD_NOTIFICATION_EMAIL || process.env.NOTIFICATION_EMAIL || 'contact@confluxai.in';

const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('https://'));
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const escapeHtml = (str: string) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

    const {
      name,
      company,
      email,
      phone,
      goal,
      message,
      source,
      landing_page,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      website_url_hp // Honeypot anti-spam field
    } = body || {};

    const rawBusinessId = body?.business_id || body?.businessId;
    const isUuid = (str?: string) =>
      str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) : false;
    const businessId = isUuid(rawBusinessId) ? rawBusinessId : null;

    // 1. Anti-Spam Honeypot Check: If honeypot is filled, return success silently without saving
    if (website_url_hp && website_url_hp.trim() !== '') {
      console.warn('Spam submission intercepted via honeypot field.');
      return res.status(200).json({ success: true, lead_id: 'SPAM-FILTERED' });
    }

    // 2. Server-Side Validation & Input Limits
    if (!name || !email || (!company && !body.business)) {
      return res.status(400).json({ error: 'Missing required fields: name, email, and company/business.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    // Input length caps & HTML sanitization to prevent XSS / header injection
    const cleanName = escapeHtml(String(name).trim().substring(0, 100));
    const cleanEmail = String(email).trim().substring(0, 100);
    const business = escapeHtml(String(company || body.business || 'Not Specified').trim().substring(0, 150));
    const cleanPhone = escapeHtml(String(phone || 'Not provided').trim().substring(0, 30));
    const service = escapeHtml(String(goal || body.service || 'General Inbound Inquiry').trim().substring(0, 100));
    const cleanMessage = escapeHtml(String(message || 'No additional message').trim().substring(0, 2000));
    const cleanSource = escapeHtml(String(source || 'Conflux Business Profile').trim().substring(0, 100));
    const cleanLandingPage = escapeHtml(String(landing_page || '/').trim().substring(0, 200));

    const leadId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;

    let dbSuccess = false;
    let emailSuccess = false;
    let targetBusinessEmail: string | null = null;

    // 3. Save Lead into Supabase Database if configured
    if (supabase) {
      try {
        // Resolve business owner email if businessId is valid
        if (businessId) {
          try {
            const { data: bizRow } = await supabase
              .from('businesses')
              .select('owner_id, verification_breakdown')
              .eq('id', businessId)
              .single();

            if (bizRow?.owner_id) {
              const { data: profileRow } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', bizRow.owner_id)
                .single();
              if (profileRow?.email) {
                targetBusinessEmail = profileRow.email;
              }
            } else if (bizRow?.verification_breakdown?.contactEmail) {
              targetBusinessEmail = bizRow.verification_breakdown.contactEmail;
            }
          } catch {
            // Non-blocking business email lookup
          }
        }

        const leadRecord: any = {
          business_id: businessId,
          contact_name: cleanName,
          business_name: business,
          contact_email: cleanEmail,
          contact_phone: cleanPhone,
          service_requested: service,
          message: cleanMessage,
          status: 'PENDING',
          created_at: new Date().toISOString()
        };
        if (leadId) {
          leadRecord.id = leadId;
        }

        const { error: dbError } = await supabase.from('leads').insert([leadRecord]);
        if (dbError) {
          console.error('Supabase lead insertion error:', dbError);
        } else {
          dbSuccess = true;
        }
      } catch (dbErr) {
        console.error('Database connection error while saving lead:', dbErr);
      }
    }

    // 4. Send Email Notification via Resend if API key is configured
    if (RESEND_API_KEY) {
      try {
        const emailHtml = `
          <h2>New Inbound Business Inquiry Received</h2>
          <p><strong>Lead Reference:</strong> ${leadId || 'Generated on receipt'}</p>
          <p><strong>Name:</strong> ${cleanName}</p>
          <p><strong>Target Business:</strong> ${business}</p>
          <p><strong>Customer Email:</strong> ${cleanEmail}</p>
          <p><strong>Customer Phone:</strong> ${cleanPhone}</p>
          <p><strong>Service Requested:</strong> ${service}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px; margin: 8px 0;">
            ${cleanMessage}
          </blockquote>
          <p><strong>Channel Source:</strong> ${cleanSource}</p>
          <p><strong>Landing Page:</strong> ${cleanLandingPage}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b;">
            This inquiry was recorded by Conflux Platform. Direct reply will address the prospective customer at ${cleanEmail}.
          </p>
        `;

        const recipients = [LEAD_NOTIFICATION_EMAIL];
        if (targetBusinessEmail && !recipients.includes(targetBusinessEmail)) {
          recipients.unshift(targetBusinessEmail);
        }

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL,
            to: recipients,
            reply_to: cleanEmail,
            subject: `[Conflux Lead] ${cleanName} inquiring for ${business}`,
            html: emailHtml
          })
        });

        if (emailRes.ok) {
          emailSuccess = true;
        } else {
          const resendErr = await emailRes.text().catch(() => '');
          console.error('Resend email API returned non-OK status:', emailRes.status, resendErr);
        }
      } catch (emailErr) {
        console.error('Resend email dispatch error:', emailErr);
      }
    }

    // Strictly enforce success truth: must have succeeded in DB or Email
    if (!dbSuccess && !emailSuccess) {
      return res.status(503).json({
        success: false,
        error: 'Inquiry delivery failed: Database storage and email notification gateways are currently unconfigured or unreachable. Please contact the business directly via WhatsApp or phone.'
      });
    }

    return res.status(200).json({
      success: true,
      lead_id: leadId,
      message: 'Inquiry routed successfully.'
    });
  } catch (err: any) {
    console.error('Contact handler fatal error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error processing inquiry.' });
  }
}
