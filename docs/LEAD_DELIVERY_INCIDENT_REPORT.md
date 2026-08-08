# 🚨 Conflux AI — Lead Delivery Incident & Resolution Report

**Incident ID:** INC-2026-0808-LEAD  
**Target Domain:** `https://confluxai.in`  
**Web Repository:** [`Tarunjit45/Conflux-AI`](https://github.com/Tarunjit45/Conflux-AI)  
**Priority:** **P0 — Revenue Critical**  
**Status:** **RESOLVED & PROTECTED**

---

## 1. 📌 Incident Overview & Root Cause

### The Problem:
Visitors could submit an enquiry form on `confluxai.in`, but email notifications were not reliably landing in the official company inbox (`tarunjitbiswas24@gmail.com`).

### Root Cause Analysis:
1. **Unreliable Client-Side Script (`EmailJS`):** The legacy contact component attempted to send emails directly from the user's browser using `@emailjs/browser` with placeholder keys (`YOUR_EMAILJS_PUBLIC_KEY`). Adblockers, browser CORS policies, and missing keys caused silent failures.
2. **Missing Database-First Safeguard:** In the old implementation, if EmailJS failed, the lead risk lost visibility if Supabase insertion was bypassed or unverified.

---

## 2. 🛠️ Resolution & Architectural Fixes Implemented

### A. Decoupled Serverless Endpoint (`api/contact.ts`)
- Engineered a Vercel Node.js Serverless Function at `POST /api/contact`.
- **Zero Frontend Secrets:** No API keys or credentials exposed in Vite client bundles.

### B. "Save First, Email Second" Protection
```text
User Submits Form
       ↓
Server-Side Validation & HTML Sanitization
       ↓
1. SAVE FIRST: Insert into Supabase `leads` table (status = 'pending')
       ↓
2. EMAIL SECOND: Attempt Resend Transactional Email API Dispatch
       ↓
3. AUDIT TRAIL: Update database record (status = 'sent' or 'failed', attempts = 1)
       ↓
4. Return HTTP 200 JSON Success ➔ Client Redirects to /thank-you
```

### C. Standardized Email Headers & Content Format
- **Subject:** `New Conflux AI Lead — [Service] — [Company]`
- **From:** `Conflux AI Growth System <onboarding@resend.dev>` (or verified domain `leads@confluxai.in`)
- **To:** `LEAD_NOTIFICATION_EMAIL` (`tarunjitbiswas24@gmail.com`)
- **Reply-To:** Prospect's submitted email address (`reply_to: cleanEmail`)

### D. Anti-Spam & Input Security
- **Honeypot Trap (`website_url_hp`):** Bot submissions filling this hidden field are trapped silently without database pollution or email spam.
- **Server Validation & Sanitization:** Email regex validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), HTML character escaping (`escapeHtml`), and input length caps.

---

## 3. 🧪 Production Test Matrix Results

| Test ID | Test Scenario | Expected Outcome | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TEST-01** | Valid Lead Submission | DB: `SUCCESS`, Email: `DISPATCHED`, Navigation: `/thank-you` | `[HTTP 200] Lead stored & redirected` | **`PASS`** |
| **TEST-02** | Invalid Email (`test@invalid`) | Server HTTP 400 Bad Request, no fake success | `[HTTP 400] Invalid email format` | **`PASS`** |
| **TEST-03** | Missing Required Fields | Server HTTP 400 Bad Request | `[HTTP 400] Missing required fields` | **`PASS`** |
| **TEST-04** | Email API Warning/Outage | Lead safely stored in Supabase (`status: failed`), user redirected to `/thank-you` | `Lead stored, notification_status: failed` | **`PASS`** |
| **TEST-05** | Anti-Spam Honeypot | Silent trap (`SPAM-FILTERED`), zero database pollution | `[HTTP 200] SPAM-FILTERED` | **`PASS`** |
| **TEST-06** | Mobile Layout Submission | Flawless form rendering & `/thank-you` redirect | Mobile verified | **`PASS`** |

---

## 4. 🌐 Domain Email Authentication Guidance (SPF / DKIM / DMARC)

To guarantee **100% inbox delivery** (avoiding spam folders) when using custom domain sender (`leads@confluxai.in`):

Add the following DNS records to your domain provider (`confluxai.in`):

1. **SPF Record (TXT):**
   - **Host:** `@`
   - **Value:** `v=spf1 include:amazonses.com include:resend.com ~all`
2. **DKIM Record (CNAME):**
   - Provided in Resend / Mail provider dashboard.
3. **DMARC Record (TXT):**
   - **Host:** `_dmarc`
   - **Value:** `v=DMARC1; p=none; rua=mailto:dmarc@confluxai.in`
