import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('📧 Email API called');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed'
    });
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};

    const to = String(body.to || '').trim();
    const businessName = String(
      body.businessName || 'Your Business'
    ).trim();

    const status = String(
      body.status || 'APPROVED'
    ).toUpperCase();

    const reason = String(body.reason || '').trim();

    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email is required.'
      });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is missing');

      return res.status(500).json({
        success: false,
        error: 'Email service is not configured.'
      });
    }

    console.log('Sending email to:', to);

    const { data, error } = await resend.emails.send({
      from: 'Conflux AI <onboarding@resend.dev>',
      to: [to],
      subject: `Conflux AI - Status Update for ${businessName}`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Conflux AI Status Update</h2>

          <p>Hello,</p>

          <p>
            Your business <strong>${businessName}</strong>
            has been updated.
          </p>

          <p>
            <strong>Status:</strong> ${status}
          </p>

          ${
            reason
              ? `<p><strong>Reason:</strong> ${reason}</p>`
              : ''
          }

          <br />

          <p>
            Best regards,<br />
            <strong>Conflux AI Team</strong>
          </p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend error:', error);

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    console.log('✅ Email sent successfully:', data);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data
    });

  } catch (error) {
    console.error('❌ Email error:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}