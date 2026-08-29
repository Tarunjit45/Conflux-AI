// Conflux Platform — Phase 1 Agent-Native Business Graph Type Definitions

import type { VerificationStatus, SourceTier } from './verify.ts';

export type UserRole = 'ADMIN' | 'BUSINESS_OWNER' | 'PUBLIC_USER';

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
  | 'HANDLOOM_CRAFT';

export type BusinessPublishStatus =
  | 'DRAFT'
  | 'PENDING_VERIFICATION'
  | 'PUBLISHED'
  | 'SUSPENDED'
  | 'ARCHIVED';

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
  description: string;
  shortSummary?: string;
  ownerId?: string;
  status: BusinessPublishStatus;
  verificationStatus: VerificationStatus;
  verificationLevel: VerificationLevel;
  confidenceScore: number;
  primaryRegistrar?: string;
  evidenceSummary?: string;
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

export type ConnectEventType =
  | 'BUSINESS_VIEW'
  | 'DISCOVERY_SEARCH'
  | 'PHONE_CLICK'
  | 'WHATSAPP_CLICK'
  | 'WEBSITE_CLICK'
  | 'DIRECTIONS_CLICK'
  | 'BOOKING_CLICK'
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
