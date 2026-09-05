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
  onlineSources?: SubmittedOnlineSources;
  publicSourceEnrichment?: PublicSourceEnrichment;
  media?: BusinessMediaItem[];
  socialLinks?: BusinessSocialLink[];
  sourceLinks?: BusinessSourceLink[];
  sourceProvenance?: {
    businessProvided: boolean;
    publicSourceEnriched: boolean;
    confluxVerified: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type MediaProvenance = 'BUSINESS_PROVIDED' | 'PUBLIC_SOURCE' | 'CONFLUX_VERIFIED' | 'ADMIN_ADDED';
export type MediaType = 'IMAGE' | 'VIDEO';
export type MediaStatus = 'ACTIVE' | 'INACTIVE';

export interface BusinessMediaItem {
  id: string;
  url: string;
  mediaType: MediaType;
  sourceUrl?: string;
  sourceName?: string;
  attribution?: string;
  dateAdded: string;
  provenance: MediaProvenance;
  status: MediaStatus;
  caption?: string;
  altText?: string;
  sortOrder?: number;
}

export interface BusinessSocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'twitter' | 'website' | 'other';
  url: string;
  label?: string;
  provenance: MediaProvenance;
  isActive: boolean;
}

export interface BusinessSourceLink {
  id: string;
  platform: string;
  url: string;
  provenance: MediaProvenance;
  isActive: boolean;
  notes?: string;
}

export interface PublicSourceField<T = string> {
  value: T;
  sourceUrl: string;
  sourcePlatform: string;
  fetchedAt: string;
}

export interface PublicMediaItem {
  id: string;
  url: string;
  sourceUrl: string;
  platform: string;
  alt: string;
  attribution: string;
  isPermitted: boolean;
  width?: number;
  height?: number;
}

export interface SourceConflict {
  field: string;
  businessProvidedValue: string;
  publicSourceValue: string;
  sourceUrl: string;
  notes: string;
}

export interface PublicSourceEnrichment {
  sourcesChecked: {
    platform: string;
    url: string;
    status: 'ACCESSIBLE' | 'RESTRICTED' | 'NOT_FOUND' | 'REQUIRES_API_AUTH';
    note?: string;
  }[];
  extractedName?: PublicSourceField<string> | string;
  extractedCategory?: PublicSourceField<string> | string;
  extractedAddress?: PublicSourceField<string> | string;
  extractedPhone?: PublicSourceField<string> | string;
  extractedOperatingHours?: PublicSourceField<string> | string;
  extractedHours?: PublicSourceField<string> | string;
  extractedSocialLinks?: (PublicSourceField<string> | string)[];
  media?: PublicMediaItem[];
  conflicts?: SourceConflict[];
  lastEnrichedAt?: string;
}

/**
 * Normalizes and extracts the verified string value from a PublicSourceField or raw string.
 * Strictly adheres to zero fabrication: returns undefined if absent, empty, or malformed.
 */
export function normalizePublicSourceField(
  field: PublicSourceField<string> | string | unknown
): string | undefined {
  if (field === null || field === undefined) {
    return undefined;
  }
  if (typeof field === 'string') {
    const trimmed = field.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (Array.isArray(field)) {
    const firstValid = field.map(normalizePublicSourceField).find((v): v is string => Boolean(v));
    return firstValid || undefined;
  }
  if (typeof field === 'object' && field !== null) {
    if ('value' in field && typeof (field as any).value === 'string') {
      const trimmed = (field as any).value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
  }
  return undefined;
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
  documentFileUrl?: string; // secure storage URL reference
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
  | 'AGENT_API_QUERY'
  | 'USER_SIGNUP'
  | 'PROFILE_COMPLETED'
  | 'CONTRIBUTION_CREATED'
  | 'CONTRIBUTION_VIEW'
  | 'CONTRIBUTION_RATED'
  | 'CONTRIBUTION_COMMENTED'
  | 'CONTRIBUTION_SHARED'
  | 'CREATOR_FOLLOWED'
  | 'BUSINESS_MENTIONED'
  | 'BUSINESS_REQUESTED'
  | 'LOCAL_MOMENT_VIEWED'
  | 'LOCAL_MOMENT_SHARED'
  | 'LOCAL_VOICE_VIEWED'
  | 'VERIFY_VIEW'
  | 'ONBOARDING_STARTED'
  | 'ONBOARDING_STEP_COMPLETED'
  | 'PROFILE_CREATED'
  | 'PROFILE_PHOTO_ADDED'
  | 'LOCALITY_SELECTED'
  | 'ONBOARDING_COMPLETED'
  | 'CONTRIBUTION_HELPED';

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
