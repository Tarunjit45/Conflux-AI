// Conflux Platform — Phase 1 Agent-Native Business Graph & Submission Type Definitions

import type { VerificationStatus, SourceTier } from './verify.ts';

export type UserRole = 'ADMIN' | 'BUSINESS_OWNER' | 'USER' | 'PUBLIC_USER';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export type BusinessType =
  | 'LOCAL_BUSINESS'
  | 'MANUFACTURER'
  | 'HEALTHCARE'
  | 'PROFESSIONAL_SERVICE'
  | 'HOSPITALITY'
  | 'INSTITUTION'
  | 'RETAIL'
  | 'AGRO_PROCESSING'
  | 'HANDLOOM_CRAFT'
  | 'FITNESS_WELLNESS'
  | 'HOME_REPAIR';

export type BusinessPublishStatus =
  | 'DRAFT'
  | 'PENDING_VERIFICATION'
  | 'PUBLISHED'
  | 'SUSPENDED'
  | 'ARCHIVED';

export type BusinessClaimStatus =
  | 'UNCLAIMED_PUBLIC'
  | 'CLAIM_PENDING'
  | 'VERIFIED_OWNER';

export type VerificationLevel =
  | 'NONE'
  | 'BASIC'
  | 'STATUTORY_VERIFIED'
  | 'ENTERPRISE_AUTHENTICATED';

export type CapabilityActionType =
  | 'CALL'
  | 'WHATSAPP'
  | 'WEBSITE'
  | 'DIRECTIONS'
  | 'BOOKING'
  | 'APPOINTMENT'
  | 'QUOTE_REQUEST'
  | 'ORDER';

export interface BusinessLocation {
  id: string;
  businessId: string;
  country: string;
  state: string;
  district: string;
  city: string;
  locality?: string;
  landmark?: string;
  postalCode?: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  serviceAreas?: string[];
  isPrimary: boolean;
}

export interface BusinessContact {
  id: string;
  businessId: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  websiteUrl?: string;
  bookingUrl?: string;
  appointmentUrl?: string;
  googleMapsUrl?: string;
  socialProfiles?: Record<string, string>;
}

export interface OperatingHoursDay {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  opensAt?: string;  // e.g. "09:00"
  closesAt?: string; // e.g. "18:00"
  isClosed: boolean;
  temporaryClosureReason?: string;
}

export interface BusinessCapability {
  id: string;
  businessId: string;
  actionType: CapabilityActionType;
  isSupported: boolean;
  endpointUrl?: string;
  phoneTarget?: string;
  availabilitySchedule?: Record<string, any>;
  machineSchema?: Record<string, any>;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'DEPRECATED';
}

export interface VerificationBreakdown {
  identityVerified: boolean;
  locationVerified: boolean;
  statutoryLicenseVerified: boolean;
  capabilitiesVerified: boolean;
  contactVerified: boolean;
  primaryRegistrarName?: string;
  statutoryLicenseNumber?: string;
  verificationMethodologyUrl: string;
}

export interface ConfluxBusiness {
  id: string;
  confluxBusinessId: string; // e.g. CFX-IN-WB-NADIA-000001
  slug: string;
  name: string;
  legalName?: string;
  businessType: BusinessType;
  categoryId: string;
  categoryName?: string;
  subcategoryIds?: string[];
  services?: string[]; // Granular capabilities/services e.g. ['USG', 'Digital X-Ray', 'CT Scan']
  landmark?: string;
  storefrontPhotoUrl?: string;
  logoUrl?: string;
  ownerPhotoUrl?: string;
  description: string;
  shortSummary?: string;
  ownerId?: string;
  status: BusinessPublishStatus;
  claimStatus: BusinessClaimStatus;
  verificationStatus: VerificationStatus;
  verificationLevel: VerificationLevel;
  confidenceScore: number;
  primaryRegistrar?: string;
  evidenceSummary?: string;
  verificationBreakdown?: VerificationBreakdown;
  lastVerifiedAt?: string;
  isClaimed: boolean;
  isIndexable: boolean;
  location: BusinessLocation;
  contact: BusinessContact;
  operatingHours: OperatingHoursDay[];
  capabilities: BusinessCapability[];
  createdAt: string;
  updatedAt: string;
}

// ── BUSINESS SUBMISSION APPLICATION TYPES ─────────────────────────────

export type SubmissionType = 'STANDARD_LISTING' | 'CONFLUX_VERIFIED';

export type SubmissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export type PrivateDocumentType =
  | 'FSSAI'
  | 'CLINICAL_ESTABLISHMENT'
  | 'TRADE_LICENSE'
  | 'GSTIN'
  | 'MSME_UDYAM'
  | 'TOURISM_REG'
  | 'PROFESSIONAL_COUNCIL'
  | 'STOREFRONT_PHOTO'
  | 'INTERIOR_PHOTO'
  | 'OWNER_ID_PROOF'
  | 'OWNER_PHOTO'
  | 'BUSINESS_LOGO'
  | 'OTHER';

export interface PrivateEvidenceDocument {
  id: string;
  documentType: PrivateDocumentType;
  documentName: string;
  documentNumber?: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  isPrivate: boolean; // strictly true for government licenses and owner identification
  fileData?: string;   // sanitized local data URI / blob reference
}

export interface SubmittedOnlineSources {
  googleBusinessUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  justdialUrl?: string;
  indiamartUrl?: string;
  otherUrl?: string;
  otherPlatformName?: string;
}

export interface ServiceInterestRequests {
  needWebsite?: boolean;
  needGooglePresence?: boolean;
  needSocialPresence?: boolean;
  needWhatsAppSystem?: boolean;
  needBookingSystem?: boolean;
  otherNotes?: string;
}

export interface BusinessSubmissionApplication {
  id: string; // e.g. APP-2026-0001
  confluxBusinessId?: string;
  submissionType: SubmissionType;
  status: SubmissionStatus;
  
  // 1. Business Identity
  businessName: string;
  legalName?: string;
  businessType: BusinessType;
  categoryId: string;
  categoryName?: string;
  yearEstablished?: number;
  description: string;
  history?: string;
  services: string[];

  // 2. Location
  district: string;
  city: string;
  landmark?: string;
  fullAddress: string;
  premisesType?: 'OWNED' | 'LEASED' | 'COMMERCIAL_COMPLEX' | 'STANDALONE_BUILDING';

  // 3. Contact & Connectivity
  phone: string;
  whatsapp?: string;
  email: string;
  websiteUrl?: string;
  hasWebsite?: boolean;
  bookingUrl?: string;
  operatingHoursSummary?: string;

  // 4. Online Sources & Missing-Asset Requests (Phase 1 Onboarding)
  onlineSources?: SubmittedOnlineSources;
  serviceInterestRequests?: ServiceInterestRequests;

  // 5. Genuine Photographs & Brand Assets (Optional)
  storefrontPhotoUrl?: string;
  interiorPhotoUrl?: string;
  logoUrl?: string;

  // 6. Owner / Responsible Person / Representative
  ownerName: string;
  ownerRole: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerPhotoUrl?: string;

  // 7. Private Official Evidence (Only accessible to authorized admins)
  privateEvidence: PrivateEvidenceDocument[];

  // 8. Category-Specific Depth
  categorySpecificDetails?: Record<string, any>;

  // 9. Mandatory Declarations
  declarationConfirmed: boolean;
  noStockImagesConfirmed: boolean;

  // 10. Admin Auditing Records, Evidence Conflicts & Commercial Plan
  adminNotes?: string;
  changesRequestedMessage?: string;
  evidenceStatus?: 'PENDING_REVIEW' | 'SOURCES_FOUND' | 'CONFLICT_DETECTED' | 'EVIDENCE_VERIFIED' | 'INSUFFICIENT_EVIDENCE';
  detectedConflicts?: string[];
  confluxPlan?: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  paymentStatus?: 'UNPAID' | 'PAID' | 'WAIVED' | 'NOT_APPLICABLE';
  reviewedBy?: string;
  reviewedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export type ConnectEventType =
  | 'BUSINESS_VIEW'
  | 'DISCOVERY_SEARCH'
  | 'PHONE_CLICK'
  | 'WHATSAPP_CLICK'
  | 'WEBSITE_CLICK'
  | 'DIRECTIONS_CLICK'
  | 'BOOKING_CLICK'
  | 'CLAIM_CLICK'
  | 'SUBMISSION_STARTED'
  | 'SUBMISSION_COMPLETED'
  | 'LEAD_SUBMITTED'
  | 'AGENT_API_QUERY';

export interface ConnectEventRecord {
  id: string;
  businessId: string;
  intentId?: string;
  eventType: ConnectEventType;
  channel: 'HUMAN_WEB' | 'AI_AGENT_REST_API' | 'AI_AGENT_MCP';
  sessionPseudonym?: string;
  createdAt: string;
}

export interface BusinessSearchParams {
  query?: string;
  district?: string;
  city?: string;
  category?: string;
  service?: string;
  verifiedOnly?: boolean;
  openNow?: boolean;
  requiredAction?: CapabilityActionType;
  limit?: number;
  offset?: number;
}

export interface RankingExplanation {
  score: number;
  reasonCodes: string[];
}

export interface BusinessSearchResult {
  business: ConfluxBusiness;
  rankingExplanation: RankingExplanation;
}
