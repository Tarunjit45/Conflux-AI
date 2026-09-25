// Conflux Platform — Centralized Transactional Email & Notification Types
// Core Principle: Transactional notifications are strictly distinguished from optional marketing emails.

export type EmailEventType =
  // Verification lifecycle
  | 'VERIFICATION_PAYMENT_SUCCESS'
  | 'VERIFICATION_SUBMITTED'
  | 'VERIFICATION_MORE_EVIDENCE'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED'
  // Business lifecycle
  | 'BUSINESS_SUBMITTED'
  | 'BUSINESS_APPROVED'
  | 'BUSINESS_CLAIMED'
  // Account & security
  | 'ACCOUNT_CREATED'
  | 'ACCOUNT_VERIFY_EMAIL'
  | 'ACCOUNT_PASSWORD_RESET'
  | 'ACCOUNT_SECURITY_ALERT'
  // Admin & operations notifications
  | 'ADMIN_NEW_BUSINESS_SUBMISSION'
  | 'ADMIN_VERIFICATION_PAYMENT'
  | 'ADMIN_VERIFICATION_SUBMITTED'
  | 'ADMIN_MORE_EVIDENCE_RESPONSE'
  | 'ADMIN_SECURITY_ALERT';

export type EmailCategory = 'TRANSACTIONAL' | 'MARKETING';

export type EmailDeliveryStatus =
  | 'SENT'
  | 'FAILED'
  | 'SKIPPED_DUPLICATE'
  | 'SKIPPED_PREFERENCE'
  | 'SANDBOX';

export interface EmailLog {
  id: string;
  eventType: EmailEventType;
  recipient: string;
  subject: string;
  entityId?: string; // orderId, businessSlug, or userId
  status: EmailDeliveryStatus;
  provider: 'resend' | 'sandbox' | 'mock' | 'smtp';
  providerMessageId?: string;
  idempotencyKey?: string;
  retryCount: number;
  errorMessage?: string;
  category: EmailCategory;
  createdAt: string;
  updatedAt?: string;
}

export interface UserEmailPreferences {
  email: string;
  allowMarketing: boolean;
  allowCommunityUpdates: boolean;
  updatedAt: string;
}

export interface EmailSendRequest {
  eventType: EmailEventType;
  recipient: string;
  recipientName?: string;
  entityId?: string;
  idempotencyKey?: string;
  category?: EmailCategory; // Defaults to 'TRANSACTIONAL'
  data: Record<string, any>;
}

export interface EmailSendResult {
  success: boolean;
  status: EmailDeliveryStatus;
  messageId?: string;
  error?: string;
  idempotencyKey?: string;
  retryCount?: number;
}
