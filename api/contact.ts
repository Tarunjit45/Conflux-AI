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
      utm_campaign
    } = body || {};

    // 1. Server-Side Validation
    if (!name || !email || (!company && !body.business)) {
      return res.status(400).json({ error: 'Missing required fields: name, email, and company/business.' });
    }

    const business = company || body.business || 'Not Specified';
    const service = goal || body.service || 'General AI & Digital Growth';
    const submittedAt = new Date().toISOString();

    // 2. SAVE FIRST: Store Lead in Supabase with notification_status = 'pending'
    let leadRecordId = `LEAD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            name,
            email,
            phone: phone || 'Not provided',
            company: business,
            goal: service,
            message: message || 'No additional message',
            notification_status: 'pending',
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

    // 3. Formulate Email Notification Content
    const emailSubject = `New Conflux AI Lead — ${service} — ${business}`;
    const emailText = `NEW CONFLUX AI LEAD
Name: ${name}
Business: ${business}
Email: ${email}
Phone: ${phone || 'Not provided'}
Requested Service: ${service}
Message: ${message || 'None'}
Source: ${source || 'Direct Website'}
Landing Page: ${landing_page || '/'}
UTM Source: ${utm_source || 'None'}
UTM Medium: ${utm_medium || 'None'}
UTM Campaign: ${utm_campaign || 'None'}
Submitted At: ${submittedAt}
Lead ID: ${leadRecordId}
`;

    // 4. EMAIL SECOND: Attempt Transactional Email Dispatch via Resend API
    let emailSentSuccessfully = false;

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
            reply_to: email, // Prospect's email as Reply-To
            subject: emailSubject,
            text: emailText
          })
        });

        if (emailRes.ok) {
          emailSentSuccessfully = true;
          console.log(`Successfully sent email notification for Lead ID: ${leadRecordId}`);
        } else {
          const errText = await emailRes.text();
          console.warn('Resend Email Notification Warning:', errText);
        }
      } catch (emailErr) {
        console.warn('Resend Email Dispatch Warning:', emailErr);
      }
    } else {
      console.log('RESEND_API_KEY not configured in environment variables. Lead safely saved to database.');
    }

    // 5. Update Notification Status in Supabase (sent / failed)
    try {
      await supabase
        .from('leads')
        .update({ notification_status: emailSentSuccessfully ? 'sent' : 'failed' })
        .eq('id', leadRecordId);
    } catch (statusErr) {
      console.warn('Notice updating lead notification_status:', statusErr);
    }

    // 6. Return HTTP 200 Success to Client
    return res.status(200).json({
      success: true,
      lead_id: leadRecordId,
      notification_status: emailSentSuccessfully ? 'sent' : (RESEND_API_KEY ? 'failed' : 'logged_to_db')
    });

  } catch (err: any) {
    console.error('Server-side Contact Handler Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
