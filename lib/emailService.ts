// Conflux Platform — Centralized Transactional Email & Notification Service
// Architectural Principle: Single point of contact for all application events (EVENT -> TEMPLATE -> RECIPIENT -> SEND -> LOG).
// Invariant: Non-blocking, idempotent, transactional, and never leaks credentials to client.

import { supabase, isSupabaseConfigured } from './supabase.ts';
import { compileEmailTemplate } from './emailTemplates.ts';
import type {
  EmailEventType,
  EmailLog,
  EmailSendRequest,
  EmailSendResult,
  EmailDeliveryStatus,
  UserEmailPreferences
} from '../types/email.ts';
import type { VerificationOrder } from './verificationPaymentService.ts';
import type { ConfluxBusiness, UserProfile } from '../types/business.ts';

const LOCAL_STORAGE_EMAIL_LOGS_KEY = 'conflux_audit_email_logs';
const ADMIN_DEFAULT_EMAIL = 'admin@confluxai.in';

let memoryEmailLogs: EmailLog[] = [];
let memoryUserPreferences: Record<string, UserEmailPreferences> = {};

export class EmailService {
  /**
   * Retrieve local cached email logs
   */
  private getLocalLogs(): EmailLog[] {
    let stored: EmailLog[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_EMAIL_LOGS_KEY);
        stored = raw ? JSON.parse(raw) : [];
      } catch {
        stored = [];
      }
    }
    const combined = [...memoryEmailLogs, ...stored];
    const map = new Map<string, EmailLog>();
    combined.forEach(log => {
      if (!map.has(log.id)) map.set(log.id, log);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Save a single log entry locally
   */
  private saveLocalLog(log: EmailLog) {
    memoryEmailLogs.unshift(log);
    if (typeof localStorage !== 'undefined') {
      try {
        const current = this.getLocalLogs();
        const existsIdx = current.findIndex(l => l.id === log.id || (l.idempotencyKey && l.idempotencyKey === log.idempotencyKey));
        if (existsIdx >= 0) {
          current[existsIdx] = log;
        } else {
          current.unshift(log);
        }
        localStorage.setItem(LOCAL_STORAGE_EMAIL_LOGS_KEY, JSON.stringify(current.slice(0, 100)));
      } catch {}
    }
  }

  /**
   * Central Dispatch Method:
   * EVENT -> TEMPLATE -> RECIPIENT -> SEND -> LOG RESULT
   */
  async sendEventEmail(req: EmailSendRequest): Promise<EmailSendResult> {
    const category = req.category || 'TRANSACTIONAL';
    const cleanRecipient = String(req.recipient || '').trim().toLowerCase();

    if (!cleanRecipient || !req.eventType) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Missing recipient or eventType'
      };
    }

    // Deterministic Idempotency Key calculation
    const idempotencyKey =
      req.idempotencyKey ||
      `${req.eventType}:${req.entityId || cleanRecipient}:${req.data?.status || req.data?.step || 'initial'}`;

    // 1. Client-Side Idempotency Check
    const localLogs = this.getLocalLogs();
    const existingSent = localLogs.find(
      l => l.idempotencyKey === idempotencyKey && ['SENT', 'SANDBOX'].includes(l.status)
    );
    if (existingSent) {
      return {
        success: true,
        status: 'SKIPPED_DUPLICATE',
        idempotencyKey,
        messageId: existingSent.providerMessageId
      };
    }

    // 2. Marketing Preference Check
    if (category === 'MARKETING') {
      const prefs = this.getUserPreferences(cleanRecipient);
      if (!prefs.allowMarketing) {
        return {
          success: true,
          status: 'SKIPPED_PREFERENCE',
          idempotencyKey
        };
      }
    }

    // Render template upfront for fallback/sandbox logging
    const rendered = compileEmailTemplate(req.eventType, req.data);

    // 3. Dispatch to serverless endpoint /api/send-email (if in browser environment)
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: req.eventType,
            recipient: cleanRecipient,
            recipientName: req.recipientName,
            entityId: req.entityId,
            idempotencyKey,
            category,
            data: req.data
          })
        });

        if (response.ok) {
          const result = (await response.json()) as EmailSendResult;
          const logEntry: EmailLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            eventType: req.eventType,
            recipient: cleanRecipient,
            subject: rendered.subject,
            entityId: req.entityId,
            status: result.status,
            provider: 'resend',
            providerMessageId: result.messageId,
            idempotencyKey,
            retryCount: result.retryCount || 0,
            error_message: result.error,
            category,
            createdAt: new Date().toISOString()
          };
          this.saveLocalLog(logEntry);
          return result;
        }
      } catch (fetchErr) {
        // Fallback to local sandbox logger when API endpoint is unavailable (e.g. dev/test mode)
      }
    }

    // 4. Sandbox / Node Test Fallback (Self-contained simulation)
    const sandboxMessageId = `sbx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logEntry: EmailLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventType: req.eventType,
      recipient: cleanRecipient,
      subject: rendered.subject,
      entityId: req.entityId,
      status: 'SANDBOX',
      provider: 'sandbox',
      providerMessageId: sandboxMessageId,
      idempotencyKey,
      retryCount: 0,
      category,
      createdAt: new Date().toISOString()
    };
    this.saveLocalLog(logEntry);

    // Also persist to Supabase if configured and available
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('email_logs').upsert({
          event_type: logEntry.eventType,
          recipient: logEntry.recipient,
          subject: logEntry.subject,
          entity_id: logEntry.entityId || null,
          status: logEntry.status,
          provider: logEntry.provider,
          provider_message_id: logEntry.providerMessageId,
          idempotency_key: logEntry.idempotencyKey,
          retry_count: logEntry.retryCount,
          category: logEntry.category,
          updated_at: new Date().toISOString()
        }, { onConflict: 'idempotency_key' });
      } catch {}
    }

    return {
      success: true,
      status: 'SANDBOX',
      idempotencyKey,
      messageId: sandboxMessageId
    };
  }

  // ==========================================================================
  // TYPED EVENT HELPERS — VERIFICATION LIFECYCLE
  // ==========================================================================

  /**
   * 1. Cashfree Payment Confirmed (₹499 Paid Successfully)
   * Dispatches official payment receipt and submission link.
   */
  async sendVerificationPaymentSuccess(order: VerificationOrder): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'VERIFICATION_PAYMENT_SUCCESS',
      recipient: order.customerEmail,
      recipientName: order.customerName,
      entityId: order.orderId,
      idempotencyKey: `VERIFICATION_PAYMENT_SUCCESS:${order.orderId}`,
      category: 'TRANSACTIONAL',
      data: {
        orderId: order.orderId,
        businessSlug: order.businessSlug,
        businessName: order.businessName,
        customerName: order.customerName,
        amountInr: order.amountInr,
        paymentReference: order.paymentReference,
        paymentTime: order.paymentTime
      }
    });
  }

  /**
   * 2. Evidence Submitted to Review Queue
   */
  async sendVerificationSubmitted(order: VerificationOrder): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'VERIFICATION_SUBMITTED',
      recipient: order.customerEmail,
      recipientName: order.customerName,
      entityId: order.orderId,
      idempotencyKey: `VERIFICATION_SUBMITTED:${order.orderId}:${order.updatedAt || 'submitted'}`,
      category: 'TRANSACTIONAL',
      data: {
        orderId: order.orderId,
        businessSlug: order.businessSlug,
        businessName: order.businessName
      }
    });
  }

  /**
   * 3. Admin Requests Additional Statutory Evidence
   */
  async sendVerificationMoreEvidence(order: VerificationOrder, notes: string): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'VERIFICATION_MORE_EVIDENCE',
      recipient: order.customerEmail,
      recipientName: order.customerName,
      entityId: order.orderId,
      idempotencyKey: `VERIFICATION_MORE_EVIDENCE:${order.orderId}:${Date.now()}`,
      category: 'TRANSACTIONAL',
      data: {
        orderId: order.orderId,
        businessSlug: order.businessSlug,
        businessName: order.businessName,
        notes: notes || order.evidenceRequestedNotes
      }
    });
  }

  /**
   * 4. Verification Approved (Conflux Verified Badge Active)
   */
  async sendVerificationApproved(order: VerificationOrder): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'VERIFICATION_APPROVED',
      recipient: order.customerEmail,
      recipientName: order.customerName,
      entityId: order.orderId,
      idempotencyKey: `VERIFICATION_APPROVED:${order.orderId}`,
      category: 'TRANSACTIONAL',
      data: {
        orderId: order.orderId,
        businessSlug: order.businessSlug,
        businessName: order.businessName,
        verifiedAt: order.verifiedAt,
        expiresAt: order.expiresAt
      }
    });
  }

  /**
   * 5. Verification Rejected (Evaluation Outcome Explained)
   */
  async sendVerificationRejected(order: VerificationOrder, reason: string): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'VERIFICATION_REJECTED',
      recipient: order.customerEmail,
      recipientName: order.customerName,
      entityId: order.orderId,
      idempotencyKey: `VERIFICATION_REJECTED:${order.orderId}`,
      category: 'TRANSACTIONAL',
      data: {
        orderId: order.orderId,
        businessSlug: order.businessSlug,
        businessName: order.businessName,
        reason: reason || order.rejectionReason || order.reviewNotes
      }
    });
  }

  // ==========================================================================
  // TYPED EVENT HELPERS — BUSINESS DIRECTORY LIFECYCLE
  // ==========================================================================

  /**
   * 6. Business Submission Received
   */
  async sendBusinessSubmitted(business: ConfluxBusiness, submitterEmail?: string): Promise<EmailSendResult> {
    const recipient = submitterEmail || business.contact.email;
    if (!recipient) return { success: false, status: 'FAILED', error: 'No contact email for business submitter' };

    return this.sendEventEmail({
      eventType: 'BUSINESS_SUBMITTED',
      recipient,
      entityId: business.slug || business.id,
      idempotencyKey: `BUSINESS_SUBMITTED:${business.id || business.slug}`,
      category: 'TRANSACTIONAL',
      data: {
        businessName: business.name,
        city: business.location.city,
        slug: business.slug
      }
    });
  }

  /**
   * 7. Business Approved & Published
   */
  async sendBusinessApproved(business: ConfluxBusiness): Promise<EmailSendResult> {
    const recipient = business.contact.email;
    if (!recipient) return { success: false, status: 'FAILED', error: 'No contact email for business owner' };

    return this.sendEventEmail({
      eventType: 'BUSINESS_APPROVED',
      recipient,
      entityId: business.slug || business.id,
      idempotencyKey: `BUSINESS_APPROVED:${business.id || business.slug}`,
      category: 'TRANSACTIONAL',
      data: {
        businessName: business.name,
        businessSlug: business.slug
      }
    });
  }

  /**
   * 8. Business Ownership Claim Received
   */
  async sendBusinessClaimed(
    business: ConfluxBusiness,
    ownerInfo: { ownerName: string; ownerEmail: string; ownerPhone: string; statutoryProofText: string }
  ): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'BUSINESS_CLAIMED',
      recipient: ownerInfo.ownerEmail,
      recipientName: ownerInfo.ownerName,
      entityId: business.slug || business.id,
      idempotencyKey: `BUSINESS_CLAIMED:${business.id}:${ownerInfo.ownerEmail}`,
      category: 'TRANSACTIONAL',
      data: {
        businessName: business.name,
        ownerName: ownerInfo.ownerName
      }
    });
  }

  // ==========================================================================
  // TYPED EVENT HELPERS — ACCOUNT & SECURITY
  // ==========================================================================

  async sendAccountCreated(user: UserProfile): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'ACCOUNT_CREATED',
      recipient: user.email,
      recipientName: user.fullName,
      entityId: user.id,
      idempotencyKey: `ACCOUNT_CREATED:${user.id || user.email}`,
      category: 'TRANSACTIONAL',
      data: {
        fullName: user.fullName || user.email.split('@')[0]
      }
    });
  }

  async sendAccountVerifyEmail(email: string, verifyUrl: string): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'ACCOUNT_VERIFY_EMAIL',
      recipient: email,
      idempotencyKey: `ACCOUNT_VERIFY_EMAIL:${email}:${Date.now()}`,
      category: 'TRANSACTIONAL',
      data: { verifyUrl }
    });
  }

  async sendAccountPasswordReset(email: string, resetUrl: string): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'ACCOUNT_PASSWORD_RESET',
      recipient: email,
      idempotencyKey: `ACCOUNT_PASSWORD_RESET:${email}:${Date.now()}`,
      category: 'TRANSACTIONAL',
      data: { resetUrl }
    });
  }

  async sendAccountSecurityAlert(email: string, details: string): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'ACCOUNT_SECURITY_ALERT',
      recipient: email,
      idempotencyKey: `ACCOUNT_SECURITY_ALERT:${email}:${Date.now()}`,
      category: 'TRANSACTIONAL',
      data: { details }
    });
  }

  // ==========================================================================
  // TYPED EVENT HELPERS — ADMIN & OPERATIONS NOTIFICATIONS
  // ==========================================================================

  async sendAdminNewBusinessSubmission(business: ConfluxBusiness, submitterEmail?: string): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'ADMIN_NEW_BUSINESS_SUBMISSION',
      recipient: ADMIN_DEFAULT_EMAIL,
      entityId: business.slug || business.id,
      idempotencyKey: `ADMIN_NEW_BUSINESS_SUBMISSION:${business.id || business.slug}`,
      category: 'TRANSACTIONAL',
      data: {
        businessName: business.name,
        city: business.location.city,
        submitterEmail: submitterEmail || business.contact.email || 'Anonymous'
      }
    });
  }

  async sendAdminVerificationPayment(order: VerificationOrder): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'ADMIN_VERIFICATION_PAYMENT',
      recipient: ADMIN_DEFAULT_EMAIL,
      entityId: order.orderId,
      idempotencyKey: `ADMIN_VERIFICATION_PAYMENT:${order.orderId}`,
      category: 'TRANSACTIONAL',
      data: {
        orderId: order.orderId,
        businessName: order.businessName,
        customerEmail: order.customerEmail,
        amountInr: order.amountInr
      }
    });
  }

  async sendAdminVerificationSubmitted(order: VerificationOrder): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'ADMIN_VERIFICATION_SUBMITTED',
      recipient: ADMIN_DEFAULT_EMAIL,
      entityId: order.orderId,
      idempotencyKey: `ADMIN_VERIFICATION_SUBMITTED:${order.orderId}:${order.updatedAt || 'init'}`,
      category: 'TRANSACTIONAL',
      data: {
        orderId: order.orderId,
        businessName: order.businessName
      }
    });
  }

  async sendAdminMoreEvidenceResponse(order: VerificationOrder): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'ADMIN_MORE_EVIDENCE_RESPONSE',
      recipient: ADMIN_DEFAULT_EMAIL,
      entityId: order.orderId,
      idempotencyKey: `ADMIN_MORE_EVIDENCE_RESPONSE:${order.orderId}:${Date.now()}`,
      category: 'TRANSACTIONAL',
      data: {
        orderId: order.orderId,
        businessName: order.businessName
      }
    });
  }

  async sendAdminSecurityAlert(title: string, details: string): Promise<EmailSendResult> {
    return this.sendEventEmail({
      eventType: 'ADMIN_SECURITY_ALERT',
      recipient: ADMIN_DEFAULT_EMAIL,
      idempotencyKey: `ADMIN_SECURITY_ALERT:${Date.now()}`,
      category: 'TRANSACTIONAL',
      data: { title, details }
    });
  }

  // ==========================================================================
  // USER PREFERENCES MANAGEMENT
  // ==========================================================================

  getUserPreferences(email: string): UserEmailPreferences {
    const cleanEmail = email.toLowerCase().trim();
    if (memoryUserPreferences[cleanEmail]) {
      return memoryUserPreferences[cleanEmail];
    }
    return {
      email: cleanEmail,
      allowMarketing: false, // Default is strictly false (Opt-in required)
      allowCommunityUpdates: true,
      updatedAt: new Date().toISOString()
    };
  }

  setUserPreferences(prefs: UserEmailPreferences): void {
    const cleanEmail = prefs.email.toLowerCase().trim();
    memoryUserPreferences[cleanEmail] = {
      ...prefs,
      email: cleanEmail,
      updatedAt: new Date().toISOString()
    };
  }

  // ==========================================================================
  // ADMIN AUDIT LOG QUERIES
  // ==========================================================================

  /**
   * Retrieve all email logs (merging database records and local session logs)
   */
  async getAllEmailLogs(): Promise<EmailLog[]> {
    let list: EmailLog[] = [];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('email_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          list = data.map(r => ({
            id: r.id,
            eventType: r.event_type as EmailEventType,
            recipient: r.recipient,
            subject: r.subject,
            entityId: r.entity_id,
            status: r.status as EmailDeliveryStatus,
            provider: r.provider,
            providerMessageId: r.provider_message_id,
            idempotencyKey: r.idempotency_key,
            retryCount: r.retry_count || 0,
            errorMessage: r.error_message,
            category: r.category,
            createdAt: r.created_at,
            updatedAt: r.updated_at
          }));
        }
      } catch (err) {
        console.warn('[EmailService.getAllEmailLogs] Supabase query notice:', err);
      }
    }

    // Merge with local logs
    const existingIds = new Set(list.map(l => l.id));
    const localLogs = this.getLocalLogs();
    localLogs.forEach(ll => {
      if (!existingIds.has(ll.id)) {
        list.push(ll);
      }
    });

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Clear store (for unit tests)
   */
  clearStore(): void {
    memoryEmailLogs = [];
    memoryUserPreferences = {};
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_EMAIL_LOGS_KEY);
      } catch {}
    }
  }
}

export const emailService = new EmailService();
