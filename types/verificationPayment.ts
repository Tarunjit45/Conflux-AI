// Conflux Platform — Paid Conflux Verified Application & Cashfree Payment Types
// Core Invariant: Payment covers the manual verification review; it is NEVER an automatic verification guarantee.

export type VerificationPaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type VerificationApplicationStatus =
  | 'PAYMENT_PENDING'          // Order created, awaiting payment confirmation
  | 'PAID'                     // Payment successful, awaiting evidence onboarding form
  | 'UNDER_REVIEW'             // Evidence submitted, pending manual admin evaluation
  | 'MORE_EVIDENCE_REQUIRED'   // Admin requested additional documentation or clarification
  | 'VERIFIED'                 // Admin approved statutory verification (1-year validity)
  | 'REJECTED'                 // Admin rejected after evaluation
  | 'EXPIRED';                 // 1-year validity lapsed without renewal

export type StatutoryDocumentType =
  | 'TRADE_LICENSE'
  | 'GSTIN'
  | 'FSSAI'
  | 'MSME_UDYAM'
  | 'CLINICAL_ESTABLISHMENT'
  | 'PROFESSIONAL_COUNCIL'
  | 'STOREFRONT_PHOTO'
  | 'OTHER';

export interface VerificationEvidencePayload {
  businessName: string;
  legalName?: string;
  fullAddress: string;
  city: string;
  district: string;
  phone: string;
  whatsapp?: string;
  websiteUrl?: string;
  googleMapsUrl?: string;
  socialLinks?: { platform: string; url: string }[];
  statutoryDocType?: StatutoryDocumentType;
  statutoryDocNumber?: string;
  evidenceDocUrl?: string;
  storefrontPhotoUrl?: string;
  applicantNotes?: string;
}

export interface VerificationOrder {
  id: string;                         // UUID or internal order ID
  orderId: string;                    // Cashfree order_id e.g. cfx_verify_...
  cfOrderId?: string;                 // Cashfree internal numeric ID
  businessId?: string;                // UUID of business in businesses table
  businessSlug: string;               // Target business slug
  businessName: string;               // Business name
  customerName: string;               // Applicant / proprietor name
  customerEmail: string;              // Applicant email for review updates
  customerPhone: string;              // Applicant contact phone
  amountInr: number;                  // Launch price: 499.00
  currency: 'INR';
  paymentStatus: VerificationPaymentStatus;
  verificationStatus: VerificationApplicationStatus;
  paymentSessionId?: string;          // Cashfree SDK session token
  paymentReference?: string;          // Cashfree payment ID / bank transaction ref
  paymentTime?: string;               // Timestamp when payment was completed
  paymentMethod?: string;             // e.g. UPI, CARD, NETBANKING
  evidence?: VerificationEvidencePayload;
  reviewNotes?: string;               // Admin evaluation notes
  evidenceRequestedNotes?: string;    // Notes for applicant when more evidence needed
  reviewedBy?: string;                // Admin username or email
  reviewedAt?: string;                // Evaluation timestamp
  verifiedAt?: string;                // Timestamp when verification approved
  expiresAt?: string;                 // Expiry date (1 year from approval)
  claimsReviewed?: string[];          // List of actual verified claims
  evidenceUsed?: string;              // Type of evidence evaluated
  evidenceSource?: string;            // Registrar or source checked
  evidenceDate?: string;              // Date of license / registration validity
  decision?: 'APPROVED' | 'REJECTED' | 'MORE_EVIDENCE_REQUIRED';
  rejectionReason?: string;           // Clear reason if rejected
  createdAt: string;
  updatedAt: string;
}

export interface CreateVerificationOrderRequest {
  businessId?: string;
  businessSlug: string;
  businessName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface CreateVerificationOrderResponse {
  success: boolean;
  orderId: string;
  paymentSessionId?: string;
  amountInr: number;
  environment: 'SANDBOX' | 'PRODUCTION';
  error?: string;
}
