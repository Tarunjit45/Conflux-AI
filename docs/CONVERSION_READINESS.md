# 🎯 Conflux AI — Business Lead Conversion Readiness Report

**Target Domain:** `https://confluxai.in`  
**Web Repository:** [`Tarunjit45/Conflux-AI`](https://github.com/Tarunjit45/Conflux-AI)  
**Audit Date:** August 9, 2026

---

## 1. 🔄 End-to-End Visitor Journey (`SEE ➔ TRUST ➔ CONTACT`)

```text
Visitor Lands on Homepage (Hero 5-Second Clarity)
                       │
                       ▼
 Inspects Visual Agency Service Cards & Workflow Diagrams
                       │
                       ▼
 Views Portfolio Work & Verification Demos
                       │
                       ▼
 Clicks Primary CTA ("Start a Project") ➔ Navigates to /contact
                       │
                       ▼
 Submits Enquiry via Serverless Form (POST /api/contact)
                       │
                       ▼
 1. SAVE FIRST: Lead saved into Supabase leads table
 2. EMAIL SECOND: Notification dispatched to confluxdotai@gmail.com
 3. REDIRECT: Visitor navigated to /thank-you
```

---

## 2. 🛡️ Lead Data Protection & Reliability Safeguards

- **Canonical Recipient:** `confluxdotai@gmail.com`
- **Reply-To Address:** Prospect's submitted email (`reply_to: cleanEmail`)
- **Zero Secrets Client-Side:** All transactional email API operations execute on Vercel Node.js Serverless Function (`api/contact.ts`).
- **Database Failure Shield:** If an email outage occurs, the lead remains safely stored in Supabase with `notification_status = 'failed'`. Zero leads lost.

---

## 3. 📈 Attribution & Analytics Capabilities

The `POST /api/contact` serverless endpoint captures full lead attribution data:
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
- `source` (referrer)
- `landing_page`
- `submitted_at` timestamp & unique `lead_id`
