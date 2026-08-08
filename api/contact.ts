import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lxfuhmvhndvnhdxtylky.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const LEAD_NOTIFICATION_EMAIL = process.env.LEAD_NOTIFICATION_EMAIL || process.env.NOTIFICATION_EMAIL || 'tarunjitbiswas24@gmail.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
    const service = escapeHtml(String(goal || body.service || 'General AI & Digital Growth').trim().substring(0, 100));
    const cleanMessage = escapeHtml(String(message || 'No additional message').trim().substring(0, 2000));
    const cleanSource = escapeHtml(String(source || 'Direct Website').trim().substring(0, 100));
    const cleanLandingPage = escapeHtml(String(landing_page || '/').trim().substring(0, 100));
    const cleanUtmSource = escapeHtml(String(utm_source || 'None').trim().substring(0, 100));
    const cleanUtmMedium = escapeHtml(String(utm_medium || 'None').trim().substring(0, 100));
    const cleanUtmCampaign = escapeHtml(String(utm_campaign || 'None').trim().substring(0, 100));
    const cleanUtmContent = escapeHtml(String(utm_content || 'None').trim().substring(0, 100));
    const submittedAt = new Date().toISOString();

    // 3. SAVE FIRST: Store Lead in Supabase with notification_status = 'pending'
    let leadRecordId = `LEAD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            company: business,
            goal: service,
            message: cleanMessage,
            notification_status: 'pending',
            notification_attempts: 0,
            created_at: submittedAt
          }
        ])
        .select();

      if (error) {
        console.warn('Supabase Lead Save Notice:', error.message);
      } else if (data && data[0]) {
        leadRecordId = data[0].id || leadRecordId;
      }
    } catch (dbErr) {
      console.warn('Supabase Lead Save Notice:', dbErr);
    }

    // 4. Formulate Email Notification Content
    const emailSubject = `New Conflux AI Lead — ${service} — ${business}`;
    const emailText = `NEW CONFLUX AI LEAD
Name: ${cleanName}
Business: ${business}
Email: ${cleanEmail}
Phone: ${cleanPhone}
Requested Service: ${service}
Message: ${cleanMessage}
Source: ${cleanSource}
Landing Page: ${cleanLandingPage}
UTM Source: ${cleanUtmSource}
UTM Medium: ${cleanUtmMedium}
UTM Campaign: ${cleanUtmCampaign}
UTM Content: ${cleanUtmContent}
Submitted At: ${submittedAt}
Lead ID: ${leadRecordId}
`;

    // 5. EMAIL SECOND: Attempt Transactional Email Dispatch via Resend API
    let emailSentSuccessfully = false;
    let notificationError = '';
    const attemptTime = new Date().toISOString();

    if (RESEND_API_KEY) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Conflux AI Growth System <onboarding@resend.dev>',
            to: [LEAD_NOTIFICATION_EMAIL],
            reply_to: cleanEmail, // Prospect's email as Reply-To
            subject: emailSubject,
            text: emailText
          })
        });

        if (emailRes.ok) {
          emailSentSuccessfully = true;
          console.log(`Successfully sent email notification for Lead ID: ${leadRecordId}`);
        } else {
          notificationError = await emailRes.text();
          console.warn('Resend Email Notification Warning:', notificationError);
        }
      } catch (emailErr: any) {
        notificationError = emailErr?.message || String(emailErr);
        console.warn('Resend Email Dispatch Warning:', emailErr);
      }
    } else {
      notificationError = 'RESEND_API_KEY not configured in environment variables.';
      console.log(notificationError);
    }

    // 6. Audit Trail Update: Update notification_status, attempts, & errors in Supabase
    try {
      await supabase
        .from('leads')
        .update({
          notification_status: emailSentSuccessfully ? 'sent' : 'failed',
          notification_attempts: 1,
          last_notification_attempt: attemptTime,
          last_notification_error: notificationError ? notificationError.substring(0, 500) : null
        })
        .eq('id', leadRecordId);
    } catch (statusErr) {
      console.warn('Notice updating lead notification audit trail:', statusErr);
    }

    // 7. Return Clean HTTP 200 Success to Client (Zero sensitive errors exposed to visitors)
    return res.status(200).json({
      success: true,
      lead_id: leadRecordId
    });

  } catch (err: any) {
    console.error('Server-side Contact Handler Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
