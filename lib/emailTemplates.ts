// Conflux Platform — Branded Transactional Email Templates Engine
// Core Invariant: Factual, responsive, accessible, with explicit verification boundaries and zero false guarantees.

import type { EmailEventType } from '../types/email.ts';

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const BASE_URL = 'https://www.confluxai.in';
const SUPPORT_EMAIL = 'contact@confluxai.in';

/**
 * Base layout wrapper ensuring consistent typography, branding, header, and legal footer
 */
function wrapLayout(contentHtml: string, previewText: string = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conflux AI Notification</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">${previewText}</div>` : ''}
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #090d16; padding: 24px 32px; border-bottom: 1px solid #1e293b;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 18px; font-weight: 900; letter-spacing: 0.05em; color: #ffffff;">
                      CONFLUX <span style="color: #38bdf8;">AI</span>
                    </span>
                    <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-top: 4px;">
                      Verified Local Business Directory &amp; Knowledge Network
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 10px 0; font-weight: 600; color: #475569;">
                Conflux AI &bull; Autonomous Local Intelligence &amp; Verified Directory
              </p>
              <p style="margin: 0 0 10px 0;">
                Ranaghat, Nadia, West Bengal 741201, India &bull; Inquiries: <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb; text-decoration: none;">${SUPPORT_EMAIL}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                <a href="${BASE_URL}/terms" style="color: #64748b; text-decoration: underline;">Terms of Service</a> &bull;
                <a href="${BASE_URL}/privacy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a> &bull;
                <a href="${BASE_URL}/refund" style="color: #64748b; text-decoration: underline;">Refund Policy</a>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8;">
                This is a transactional email regarding your Conflux account, orders, or registered business listings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Standard CTA button HTML generator
 */
function renderButton(label: string, url: string): string {
  return `
    <div style="margin: 28px 0 20px 0; text-align: center;">
      <a href="${url}" target="_blank" style="display: inline-block; background-color: #1d4ed8; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(29, 78, 216, 0.2);">
        ${label}
      </a>
    </div>
  `;
}

/**
 * Verification Boundary Notice box HTML
 */
const VERIFICATION_BOUNDARY_NOTICE = `
  <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0284c7; padding: 14px 16px; border-radius: 8px; margin: 20px 0; font-size: 12px; color: #334155; line-height: 1.5;">
    <strong>Verification Transparency Notice:</strong> The ₹499 fee is an order review fee for manual inspection of submitted statutory proof against official registries. Payment does NOT guarantee verification approval, search ranking priority, or business leads.
  </div>
`;

/**
 * Main Template Compiler
 */
export function compileEmailTemplate(
  eventType: EmailEventType,
  data: Record<string, any>
): RenderedEmail {
  switch (eventType) {
    // ------------------------------------------------------------------------
    // 1. VERIFICATION PAYMENT SUCCESS (Customer Receipt & Next Steps)
    // ------------------------------------------------------------------------
    case 'VERIFICATION_PAYMENT_SUCCESS': {
      const orderId = data.orderId || 'N/A';
      const businessName = data.businessName || 'Your Business';
      const amount = data.amountInr ? Number(data.amountInr).toFixed(2) : '499.00';
      const paymentRef = data.paymentReference || data.cfPaymentId || 'Direct Payment Settlement';
      const dateStr = data.paymentTime ? new Date(data.paymentTime).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
      const actionUrl = `${BASE_URL}/verify/payment-return?order_id=${encodeURIComponent(orderId)}`;

      const subject = `Payment Confirmed: Verification Order for ${businessName} (Order #${orderId})`;
      const html = wrapLayout(`
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; border: 1px solid #a7f3d0;">
            ✓ Payment Confirmed
          </span>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 6px 0; line-height: 1.3;">
            Verification Assessment Fee Receipt
          </h1>
          <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.5;">
            Thank you, <strong>${data.customerName || 'Business Owner'}</strong>. Your payment for manual verification review has been successfully confirmed.
          </p>
        </div>

        <!-- Receipt Docket Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; font-size: 13px;">
          <tr>
            <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;" colspan="2">
              Official Payment Receipt Docket
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 18px; color: #64748b; width: 40%;">Order ID:</td>
            <td style="padding: 10px 18px; font-family: monospace; font-weight: 700; color: #0f172a;">${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 18px; color: #64748b;">Business:</td>
            <td style="padding: 10px 18px; font-weight: 600; color: #0f172a;">${businessName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 18px; color: #64748b;">Gateway Reference:</td>
            <td style="padding: 10px 18px; font-family: monospace; color: #334155;">${paymentRef}</td>
          </tr>
          <tr>
            <td style="padding: 10px 18px; color: #64748b;">Date &amp; Time:</td>
            <td style="padding: 10px 18px; color: #334155;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding: 10px 18px; color: #64748b;">Assessment Fee:</td>
            <td style="padding: 10px 18px; color: #334155;">₹${amount} INR</td>
          </tr>
          <tr>
            <td style="padding: 10px 18px; color: #64748b;">Tax Notice:</td>
            <td style="padding: 10px 18px; color: #334155; font-style: italic;">GST is not charged</td>
          </tr>
          <tr style="border-top: 1px solid #cbd5e1; background-color: #f1f5f9;">
            <td style="padding: 12px 18px; font-weight: 800; color: #0f172a;">Total Paid:</td>
            <td style="padding: 12px 18px; font-weight: 800; color: #047857; font-size: 15px;">₹${amount} INR</td>
          </tr>
        </table>

        <!-- Next Action -->
        <div style="margin: 20px 0;">
          <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">
            Next Step: Submit Statutory Evidence
          </h2>
          <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.5;">
            To proceed with your verification, please access your order portal and submit your registration details (Trade License, GST, MSME/Udyam, or Storefront Photo).
          </p>
        </div>

        ${renderButton('Submit Verification Evidence →', actionUrl)}
        ${VERIFICATION_BOUNDARY_NOTICE}
      `, `Payment confirmed for ${businessName} verification review. Order ID: ${orderId}`);

      const text = `CONFLUX AI — Verification Assessment Fee Receipt
Payment Confirmed: Order #${orderId}
Business: ${businessName}
Amount Paid: ₹${amount} INR (GST is not charged)
Gateway Reference: ${paymentRef}
Date: ${dateStr}

Next Step: Please access your order portal to submit statutory evidence for manual review:
${actionUrl}

Notice: The ₹499 fee is an order review fee for manual inspection of submitted statutory proof against official registries. Payment does NOT guarantee verification approval, search ranking priority, or business leads.

Conflux AI • contact@confluxai.in • https://www.confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 2. VERIFICATION EVIDENCE SUBMITTED (Customer Notification)
    // ------------------------------------------------------------------------
    case 'VERIFICATION_SUBMITTED': {
      const orderId = data.orderId || 'N/A';
      const businessName = data.businessName || 'Your Business';
      const actionUrl = `${BASE_URL}/verify/payment-return?order_id=${encodeURIComponent(orderId)}`;

      const subject = `Evidence In Review: ${businessName} (Order #${orderId})`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bfdbfe;">
            Under Review
          </span>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            Verification Evidence Submitted
          </h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            We have received your statutory documents for <strong>${businessName}</strong>.
            Our verification team is manually reviewing your claims against authoritative registrar records.
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 18px 0; font-size: 13px; color: #334155;">
            <strong>Review Turnaround:</strong> Typical manual review time is <strong>1–2 business days</strong>.<br>
            Any requests for clarification or additional documentation will be sent to this email address.
          </div>
        </div>

        ${renderButton('Check Order Status →', actionUrl)}
        ${VERIFICATION_BOUNDARY_NOTICE}
      `, `Verification evidence received for ${businessName}. Status: Under Review.`);

      const text = `CONFLUX AI — Verification Evidence In Review
Business: ${businessName}
Order ID: ${orderId}

Your statutory documentation has been securely transferred to the review queue.
Typical review time: 1–2 business days.
Check status: ${actionUrl}

Conflux AI • contact@confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 3. VERIFICATION MORE EVIDENCE REQUIRED (Action Required)
    // ------------------------------------------------------------------------
    case 'VERIFICATION_MORE_EVIDENCE': {
      const orderId = data.orderId || 'N/A';
      const businessName = data.businessName || 'Your Business';
      const notes = data.notes || data.evidenceRequestedNotes || 'Please upload a clearer copy of your statutory registration certificate or address proof.';
      const actionUrl = `${BASE_URL}/verify/payment-return?order_id=${encodeURIComponent(orderId)}`;

      const subject = `Action Required: Additional Evidence Needed for ${businessName} (Order #${orderId})`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #fffbeb; color: #b45309; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; border: 1px solid #fde68a;">
            Action Required
          </span>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            Additional Evidence Requested
          </h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            Our verification team reviewed the statutory proof submitted for <strong>${businessName}</strong> and requires further clarification or additional evidence.
          </p>

          <!-- Reviewer Note Card -->
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #78350f; line-height: 1.6;">
            <strong>Reviewer Note:</strong><br>
            ${notes}
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; font-size: 12px; color: #475569; line-height: 1.5;">
            <strong>14-Day Resubmission Window:</strong> You may provide updated documents through your portal within 14 days with <strong>zero additional charge</strong>.
          </div>
        </div>

        ${renderButton('Upload Additional Evidence →', actionUrl)}
      `, `Additional evidence requested for ${businessName}. Please review the reviewer note.`);

      const text = `CONFLUX AI — Additional Evidence Requested
Business: ${businessName}
Order ID: ${orderId}

Our verification reviewer has requested additional evidence:
"${notes}"

You have 14 days to submit updated proof with zero additional charge.
Upload evidence: ${actionUrl}

Conflux AI • contact@confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 4. VERIFICATION APPROVED (Conflux Verified Badge Granted)
    // ------------------------------------------------------------------------
    case 'VERIFICATION_APPROVED': {
      const businessName = data.businessName || 'Your Business';
      const businessSlug = data.businessSlug || '';
      const verifiedAt = data.verifiedAt ? new Date(data.verifiedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
      const expiresAt = data.expiresAt ? new Date(data.expiresAt).toLocaleDateString('en-IN') : '1 Year from Approval';
      const actionUrl = businessSlug ? `${BASE_URL}/business/${businessSlug}` : `${BASE_URL}/verify`;

      const subject = `✓ Conflux Verified Approved: ${businessName}`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; border: 1px solid #a7f3d0;">
            ✓ Verification Approved
          </span>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            Congratulations, Your Business is Conflux Verified
          </h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            Our manual inspection team has successfully corroborated your declared statutory documents against official public registries.
          </p>

          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; font-size: 13px;">
            <tr>
              <td style="padding: 12px 18px; color: #64748b; width: 40%;">Verified Entity:</td>
              <td style="padding: 12px 18px; font-weight: 700; color: #0f172a;">${businessName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 18px; color: #64748b;">Verification Date:</td>
              <td style="padding: 12px 18px; color: #0f172a;">${verifiedAt}</td>
            </tr>
            <tr>
              <td style="padding: 12px 18px; color: #64748b;">Validity Period:</td>
              <td style="padding: 12px 18px; font-weight: 600; color: #047857;">Valid until ${expiresAt} (1 Year)</td>
            </tr>
            <tr>
              <td style="padding: 12px 18px; color: #64748b;">Badge Status:</td>
              <td style="padding: 12px 18px; font-weight: 700; color: #0f172a;">✓ Conflux Verified</td>
            </tr>
          </table>

          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            Your public listing now displays the official <strong>✓ Conflux Verified</strong> badge with transparent verification details and evidence provenance.
          </p>
        </div>

        ${renderButton('View Public Verified Profile →', actionUrl)}
      `, `Congratulations! ${businessName} is now Conflux Verified.`);

      const text = `CONFLUX AI — Verification Approved
Congratulations! ${businessName} is now Conflux Verified.
Verified on: ${verifiedAt}
Valid until: ${expiresAt}

View your public verified profile:
${actionUrl}

Conflux AI • contact@confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 5. VERIFICATION REJECTED (Grounded Evaluation Rationale)
    // ------------------------------------------------------------------------
    case 'VERIFICATION_REJECTED': {
      const orderId = data.orderId || 'N/A';
      const businessName = data.businessName || 'Your Business';
      const reason = data.reason || data.reviewNotes || 'Submitted evidence could not be corroborated with official statutory registries.';
      const actionUrl = `${BASE_URL}/verify`;

      const subject = `Verification Decision Notice: ${businessName} (Order #${orderId})`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #fff1f2; color: #be123c; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; border: 1px solid #fecdd3;">
            Review Completed
          </span>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            Verification Assessment Outcome
          </h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            Our manual inspection team has completed evaluation of the evidence submitted for <strong>${businessName}</strong>. Regrettably, the submitted claims could not be corroborated against official registrar records.
          </p>

          <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-left: 4px solid #e11d48; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #881337; line-height: 1.6;">
            <strong>Evaluation Reason:</strong><br>
            ${reason}
          </div>

          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            In accordance with our Verification Terms, the ₹499 assessment fee covers the cost of manual investigation and registrar lookups and is non-refundable. If you obtain updated registration certificates in the future, you may submit a fresh verification order.
          </p>
        </div>

        ${renderButton('Learn About Verification Requirements →', actionUrl)}
      `, `Verification evaluation notice for ${businessName}.`);

      const text = `CONFLUX AI — Verification Assessment Outcome
Business: ${businessName}
Order ID: ${orderId}

Evaluation Reason:
"${reason}"

Verification requirements: ${actionUrl}

Conflux AI • contact@confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 6. BUSINESS SUBMITTED (Registration Received)
    // ------------------------------------------------------------------------
    case 'BUSINESS_SUBMITTED': {
      const businessName = data.businessName || 'Your Business';
      const city = data.city || 'Ranaghat';
      const actionUrl = `${BASE_URL}/explore`;

      const subject = `Business Submission Received: ${businessName}`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #f0fdf4; color: #166534; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bbf7d0;">
            Submission Received
          </span>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            Thank You for Submitting ${businessName}
          </h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            We have received your business submission for <strong>${businessName}</strong> (${city}).
            Our moderation team will review the submitted details for factual consistency, address accuracy, and directory placement.
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; font-size: 13px; color: #334155; line-height: 1.5;">
            Once published, you will receive an approval notification with your permanent listing URL.
          </div>
        </div>

        ${renderButton('Explore Directory →', actionUrl)}
      `, `We received your business submission for ${businessName}.`);

      const text = `CONFLUX AI — Business Submission Received
Business: ${businessName} (${city})

Thank you for registering on Conflux AI. Our moderation team is reviewing your listing details.
Directory: ${actionUrl}

Conflux AI • contact@confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 7. BUSINESS APPROVED (Listing Live)
    // ------------------------------------------------------------------------
    case 'BUSINESS_APPROVED': {
      const businessName = data.businessName || 'Your Business';
      const businessSlug = data.businessSlug || '';
      const actionUrl = businessSlug ? `${BASE_URL}/business/${businessSlug}` : `${BASE_URL}/explore`;

      const subject = `Your Business is Now Live on Conflux AI: ${businessName}`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; border: 1px solid #a7f3d0;">
            ✓ Listing Published
          </span>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            ${businessName} is Now Published
          </h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            Great news! Your business profile has been approved and is now publicly discoverable across Conflux AI's local search and knowledge network.
          </p>
        </div>

        ${renderButton('View Live Listing →', actionUrl)}
      `, `${businessName} is now live on Conflux AI.`);

      const text = `CONFLUX AI — Listing Published
${businessName} is now live on Conflux AI!
View listing: ${actionUrl}

Conflux AI • contact@confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 8. BUSINESS CLAIMED (Ownership Claim Submitted)
    // ------------------------------------------------------------------------
    case 'BUSINESS_CLAIMED': {
      const businessName = data.businessName || 'Business Entity';
      const ownerName = data.ownerName || 'Claimant';
      const actionUrl = `${BASE_URL}/explore`;

      const subject = `Ownership Claim Received: ${businessName}`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bfdbfe;">
            Claim Pending Review
          </span>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            Ownership Claim Received
          </h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            Hello <strong>${ownerName}</strong>, we have received your ownership claim for <strong>${businessName}</strong>.
            Our team will review your contact details and statutory statements to authenticate proprietor rights.
          </p>
        </div>

        ${renderButton('Conflux Directory →', actionUrl)}
      `, `Ownership claim received for ${businessName}.`);

      const text = `CONFLUX AI — Ownership Claim Received
Hello ${ownerName},
We have received your ownership claim for ${businessName}. Our team will review your statutory credentials.

Conflux AI • contact@confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 9. ACCOUNT CREATED (Welcome & Confirmation)
    // ------------------------------------------------------------------------
    case 'ACCOUNT_CREATED': {
      const fullName = data.fullName || 'User';
      const actionUrl = `${BASE_URL}/auth`;

      const subject = `Welcome to Conflux AI`;
      const html = wrapLayout(`
        <div>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">
            Welcome to Conflux AI, ${fullName}!
          </h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            Your Conflux AI account has been successfully created. You can now discover verified enterprises, manage business listings, and participate in authentic community knowledge.
          </p>
        </div>

        ${renderButton('Sign In to Your Account →', actionUrl)}
      `, `Welcome to Conflux AI! Your account is ready.`);

      const text = `CONFLUX AI — Welcome
Hello ${fullName},
Your Conflux AI account has been successfully created.
Sign in: ${actionUrl}

Conflux AI • contact@confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 10. ACCOUNT VERIFY EMAIL
    // ------------------------------------------------------------------------
    case 'ACCOUNT_VERIFY_EMAIL': {
      const verifyUrl = data.verifyUrl || `${BASE_URL}/auth`;

      const subject = `Verify Your Conflux AI Email Address`;
      const html = wrapLayout(`
        <div>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">
            Verify Your Email Address
          </h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            Please click the button below to verify your email address and secure your Conflux account.
          </p>
        </div>

        ${renderButton('Verify Email Address →', verifyUrl)}
      `, `Verify your email for Conflux AI.`);

      const text = `CONFLUX AI — Email Verification
Please click the link below to verify your email address:
${verifyUrl}

Conflux AI • contact@confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 11. ACCOUNT PASSWORD RESET
    // ------------------------------------------------------------------------
    case 'ACCOUNT_PASSWORD_RESET': {
      const resetUrl = data.resetUrl || `${BASE_URL}/auth`;

      const subject = `Password Reset Request — Conflux AI`;
      const html = wrapLayout(`
        <div>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">
            Reset Your Password
          </h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            We received a request to reset the password for your Conflux AI account. If you did not initiate this request, you can safely disregard this email.
          </p>
        </div>

        ${renderButton('Reset Password →', resetUrl)}
      `, `Reset your password for Conflux AI.`);

      const text = `CONFLUX AI — Password Reset Request
To reset your password, visit:
${resetUrl}

If you did not request this, please disregard this email.
Conflux AI • contact@confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 12. ACCOUNT SECURITY ALERT
    // ------------------------------------------------------------------------
    case 'ACCOUNT_SECURITY_ALERT': {
      const alertDetails = data.details || 'A new sign-in or security modification was detected on your account.';
      const actionUrl = `${BASE_URL}/auth`;

      const subject = `Security Alert: Account Activity on Conflux AI`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #fff1f2; color: #be123c; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; border: 1px solid #fecdd3;">
            Security Notice
          </span>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            Security Notification
          </h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            ${alertDetails}
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; font-size: 12px; color: #475569; line-height: 1.5;">
            If this was you, no action is needed. If you did not authorize this change, please sign in immediately and update your security settings.
          </div>
        </div>

        ${renderButton('Review Account Security →', actionUrl)}
      `, `Security notice for your Conflux AI account.`);

      const text = `CONFLUX AI — Security Alert
${alertDetails}
Review account security: ${actionUrl}

Conflux AI • contact@confluxai.in`;

      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 13. ADMIN: NEW BUSINESS SUBMISSION
    // ------------------------------------------------------------------------
    case 'ADMIN_NEW_BUSINESS_SUBMISSION': {
      const businessName = data.businessName || 'New Entity';
      const submitterEmail = data.submitterEmail || 'Unknown';
      const city = data.city || 'Ranaghat';
      const actionUrl = `${BASE_URL}/admin/businesses`;

      const subject = `[Admin] New Business Submitted: ${businessName} (${city})`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px;">
            Admin Moderation Queue
          </span>
          <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            New Business Registration
          </h1>
          <p style="font-size: 13px; color: #334155; line-height: 1.6;">
            A new business has been registered on Conflux AI and is waiting for review:
          </p>
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 16px 0; font-size: 12px;">
            <tr><td style="padding: 8px 14px; color: #64748b; width: 35%;">Business:</td><td style="padding: 8px 14px; font-weight: 700;">${businessName}</td></tr>
            <tr><td style="padding: 8px 14px; color: #64748b;">Location:</td><td style="padding: 8px 14px;">${city}</td></tr>
            <tr><td style="padding: 8px 14px; color: #64748b;">Submitter:</td><td style="padding: 8px 14px;">${submitterEmail}</td></tr>
          </table>
        </div>
        ${renderButton('Open Admin Console →', actionUrl)}
      `);

      const text = `[ADMIN NOTIFICATION] New Business Submitted: ${businessName} (${city}) by ${submitterEmail}. Open console: ${actionUrl}`;
      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 14. ADMIN: NEW VERIFICATION PAYMENT
    // ------------------------------------------------------------------------
    case 'ADMIN_VERIFICATION_PAYMENT': {
      const orderId = data.orderId || 'N/A';
      const businessName = data.businessName || 'Business';
      const customerEmail = data.customerEmail || 'Unknown';
      const amount = data.amountInr || '499.00';
      const actionUrl = `${BASE_URL}/admin/businesses`;

      const subject = `[Admin] ₹${amount} Paid: Verification Order #${orderId} (${businessName})`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px;">
            Payment Captured
          </span>
          <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            Verification Assessment Fee Received
          </h1>
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 16px 0; font-size: 12px;">
            <tr><td style="padding: 8px 14px; color: #64748b; width: 35%;">Order ID:</td><td style="padding: 8px 14px; font-family: monospace; font-weight: 700;">${orderId}</td></tr>
            <tr><td style="padding: 8px 14px; color: #64748b;">Business:</td><td style="padding: 8px 14px; font-weight: 700;">${businessName}</td></tr>
            <tr><td style="padding: 8px 14px; color: #64748b;">Customer:</td><td style="padding: 8px 14px;">${customerEmail}</td></tr>
            <tr><td style="padding: 8px 14px; color: #64748b;">Amount:</td><td style="padding: 8px 14px; font-weight: 700; color: #047857;">₹${amount} INR</td></tr>
          </table>
        </div>
        ${renderButton('View Verification Queue →', actionUrl)}
      `);

      const text = `[ADMIN NOTIFICATION] ₹${amount} Paid for Verification Order #${orderId} (${businessName}) by ${customerEmail}. Console: ${actionUrl}`;
      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 15. ADMIN: VERIFICATION EVIDENCE SUBMITTED
    // ------------------------------------------------------------------------
    case 'ADMIN_VERIFICATION_SUBMITTED': {
      const orderId = data.orderId || 'N/A';
      const businessName = data.businessName || 'Business';
      const actionUrl = `${BASE_URL}/admin/businesses`;

      const subject = `[Admin] Evidence Submitted: Review Queue #${orderId} (${businessName})`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px;">
            Ready for Evaluation
          </span>
          <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            Verification Dossier Ready
          </h1>
          <p style="font-size: 13px; color: #334155; line-height: 1.6;">
            Applicant has submitted evidence documents for <strong>${businessName}</strong> (Order #${orderId}).
            Ready for admin statutory registrar lookup and evaluation.
          </p>
        </div>
        ${renderButton('Evaluate in Review Queue →', actionUrl)}
      `);

      const text = `[ADMIN NOTIFICATION] Verification evidence dossier ready for ${businessName} (Order #${orderId}). Review: ${actionUrl}`;
      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 16. ADMIN: MORE EVIDENCE RESPONSE
    // ------------------------------------------------------------------------
    case 'ADMIN_MORE_EVIDENCE_RESPONSE': {
      const orderId = data.orderId || 'N/A';
      const businessName = data.businessName || 'Business';
      const actionUrl = `${BASE_URL}/admin/businesses`;

      const subject = `[Admin] Resubmitted Evidence: #${orderId} (${businessName})`;
      const html = wrapLayout(`
        <div>
          <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">
            Updated Evidence Provided
          </h1>
          <p style="font-size: 13px; color: #334155; line-height: 1.6;">
            Applicant has uploaded revised proof in response to your request for <strong>${businessName}</strong> (Order #${orderId}).
          </p>
        </div>
        ${renderButton('Open Review Queue →', actionUrl)}
      `);

      const text = `[ADMIN NOTIFICATION] Updated evidence submitted for ${businessName} (Order #${orderId}). Console: ${actionUrl}`;
      return { subject, html, text };
    }

    // ------------------------------------------------------------------------
    // 17. ADMIN: SECURITY ALERT
    // ------------------------------------------------------------------------
    case 'ADMIN_SECURITY_ALERT': {
      const details = data.details || 'Discrepancy or critical system alert';
      const actionUrl = `${BASE_URL}/admin/businesses`;

      const subject = `[Admin Alert] Critical Security / Operation Notice: ${data.title || 'Event Alert'}`;
      const html = wrapLayout(`
        <div>
          <span style="display: inline-block; background-color: #fff1f2; color: #be123c; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px;">
            High Priority Alert
          </span>
          <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0;">
            Admin Attention Required
          </h1>
          <p style="font-size: 13px; color: #334155; line-height: 1.6;">
            ${details}
          </p>
        </div>
        ${renderButton('Open Admin Console →', actionUrl)}
      `);

      const text = `[ADMIN ALERT] ${data.title || 'Event Alert'}: ${details}. Console: ${actionUrl}`;
      return { subject, html, text };
    }

    default: {
      const subject = `Conflux AI Notification: ${eventType}`;
      const html = wrapLayout(`
        <h1 style="font-size: 20px; font-weight: 800; color: #0f172a;">Conflux AI Update</h1>
        <p style="font-size: 14px; color: #475569;">${data.message || 'You have an update on your Conflux account.'}</p>
      `);
      const text = `Conflux AI Notification: ${data.message || eventType}`;
      return { subject, html, text };
    }
  }
}
