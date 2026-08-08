# 🚨 Conflux AI — Lead Pipeline Audit & Root Cause Analysis

**Target Domain:** `https://confluxai.in`  
**Web Repository:** [`Tarunjit45/Conflux-AI`](https://github.com/Tarunjit45/Conflux-AI)  
**Priority:** **P0 — Revenue Critical Incident**

---

## 1. 🔍 Complete Lead Pipeline Flow

```text
[ Visitor Submits Form (ContactForm.tsx) ]
                    │
                    ▼
 [ Client Validation & Honeypot Check ]
  - Checks Name, Email, & Company
  - Checks website_url_hp anti-spam field
                    │
                    ▼
 [ HTTP POST to /api/contact Endpoint ]
  - Payload: name, email, phone, company, goal, message, source, landing_page, UTMs
                    │
                    ▼
 [ 1. Server-Side HTML Sanitization & Validation ]
  - Email Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  - String Truncation Caps (Name: 100, Email: 100, Business: 150, Message: 2000)
                    │
                    ▼
 [ 2. SAVE FIRST: Supabase DB Storage ]
  - Inserts lead record into Supabase leads table
  - Sets notification_status = 'pending', notification_attempts = 0
                    │
                    ▼
 [ 3. EMAIL SECOND: Resend API Dispatch ]
  - Checks process.env.RESEND_API_KEY
  - FROM: Conflux AI Growth System <onboarding@resend.dev>
  - TO: process.env.LEAD_NOTIFICATION_EMAIL (tarunjitbiswas24@gmail.com)
  - REPLY-TO: Prospect's submitted email
  - Subject: New Conflux AI Lead — [Service] — [Company]
                    │
           ┌────────┴────────┐
           ▼                 ▼
   [ Email Success ]   [ Email Failure / Warning ]
   status = 'sent'     status = 'failed'
           │                 │
           └────────┬────────┘
                    ▼
 [ 4. HTTP 200 JSON Response to Client ]
  - Returns { success: true, lead_id: "..." }
                    │
                    ▼
 [ 5. Client Navigation to /thank-you ]
```

---

## 2. ⚡ Audit Findings & Root Cause Analysis

### Root Cause of Email Notification Non-Delivery:
1. **Frontend-Only Legacy Dependency (`EmailJS`):** Previously, `ContactForm.tsx` relied on `@emailjs/browser` with placeholder credentials (`YOUR_EMAILJS_PUBLIC_KEY`). EmailJS client-side calls failed silently in the browser console.
2. **Missing Server Environment Variable (`RESEND_API_KEY`):** Until `RESEND_API_KEY` and `LEAD_NOTIFICATION_EMAIL` are configured in Vercel Production Environment Variables, the serverless function logs lead details safely into Supabase (`notification_status: 'failed'`) without throwing unhandled exceptions to the user.

---

## 3. 🛡️ Environment Variables Audit

| Variable Name | Required Scope | Status | Notes |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Public / Server | **`PRESENT`** | Supabase REST URL |
| `VITE_SUPABASE_ANON_KEY` | Public / Server | **`PRESENT`** | Supabase Anonymous Key |
| `SUPABASE_SERVICE_KEY` | Server Only | **`OPTIONAL`** | Supabase Service Role Key |
| `RESEND_API_KEY` | Server Only | **`REQUIRED`** | Transactional Email API Key |
| `LEAD_NOTIFICATION_EMAIL` | Server Only | **`REQUIRED`** | Lead recipient inbox (`tarunjitbiswas24@gmail.com`) |

---

## 4. ✉️ Email Headers & Recipient Taxonomy

- **`FROM`:** `Conflux AI Growth System <onboarding@resend.dev>` (or verified domain `leads@confluxai.in`)
- **`TO`:** `LEAD_NOTIFICATION_EMAIL` (`tarunjitbiswas24@gmail.com`)
- **`REPLY-TO`:** Prospect's Submitted Email (`reply_to: cleanEmail`)
- **`SUBJECT`:** `New Conflux AI Lead — [Service] — [Company]`
