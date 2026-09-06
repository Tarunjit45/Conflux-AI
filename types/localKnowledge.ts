// Conflux Platform — Local Knowledge Network & Intelligence Layer Types
// Model: PEOPLE → CONTRIBUTIONS → SIGNALS → EVIDENCE → LOCAL KNOWLEDGE → DISCOVERY → ACTION
// Grounded strictly in authentic local data. Zero fabrication, zero fake engagement.

export type ReputationBadge =
  | 'LOCAL_CONTRIBUTOR'
  | 'LOCAL_EXPLORER'
  | 'COMMUNITY_HELPER'
  | 'LOCAL_REPORTER'
  | 'FOOD_VOICE'
  | 'BUSINESS_DISCOVERER'
  | 'EVENT_CONTRIBUTOR'
  | 'TRUSTED_CONTRIBUTOR';

export interface LocalIdentityStats {
  contributionsCount: number;
  confirmedUpdatesCount: number;
  verifiedDiscoveriesCount: number;
  helpfulCorrectionsCount: number;
  ratingsGivenCount: number;
  peopleHelpedCount?: number;
  helpfulVotesCount?: number;
  accuracyPercentage?: number;
  questionsResolvedCount?: number;
}

export type ContributorStandingTier =
  | 'NEW_CONTRIBUTOR'
  | 'LOCAL_HELPER'
  | 'LOCAL_GUIDE'
  | 'TRUSTED_LOCAL'
  | 'LOCALITY_EXPERT';

export interface ContributorStanding {
  tier: ContributorStandingTier;
  label: string;
  color: string;
  badgeClass: string;
}

export function getContributorStanding(profile: {
  reputationScore?: number;
  locality?: string;
  stats?: Partial<LocalIdentityStats>;
}): ContributorStanding {
  const score = profile.reputationScore ?? 20;
  const stats = profile.stats || {};
  const locality = profile.locality || 'Ranaghat';

  if (score >= 90 && (stats.confirmedUpdatesCount || 0) >= 3) {
    return {
      tier: 'LOCALITY_EXPERT',
      label: `${locality} Expert`,
      color: '#7c3aed',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-200'
    };
  }
  if (score >= 75) {
    return {
      tier: 'TRUSTED_LOCAL',
      label: 'Trusted Local',
      color: '#059669',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200'
    };
  }
  if (score >= 60) {
    return {
      tier: 'LOCAL_GUIDE',
      label: 'Local Guide',
      color: '#0284c7',
      badgeClass: 'bg-sky-100 text-sky-900 border-sky-200'
    };
  }
  if (score >= 40) {
    return {
      tier: 'LOCAL_HELPER',
      label: 'Local Helper',
      color: '#d97706',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-200'
    };
  }
  return {
    tier: 'NEW_CONTRIBUTOR',
    label: 'New Contributor',
    color: '#64748b',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200'
  };
}

export interface CreatorLink {
  platform: 'YOUTUBE' | 'INSTAGRAM' | 'FACEBOOK' | 'WEBSITE' | 'X' | 'LINKEDIN';
  url: string;
  label?: string;
}

export type VerificationProposalStatus =
  | 'UNVERIFIED'
  | 'PENDING_REVIEW'
  | 'CONTACTED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'BLOCKED';

export interface UserVerificationRequest {
  id: string;
  userId: string;
  displayName: string;
  locality: string;
  bio?: string;
  avatarUrl?: string;
  contactMethod: 'PHONE' | 'WHATSAPP' | 'EMAIL';
  contactValue: string;
  status: VerificationProposalStatus;
  notes?: string;
  adminFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type JobStatus = 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'EXPIRED' | 'REJECTED';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

export interface LocalJob {
  id: string;
  title: string;
  companyName: string;
  businessId?: string;
  locality: string; // e.g. 'ranaghat'
  area?: string; // e.g. 'Station Road', 'Rathtala', 'Subhas Avenue'
  description: string;
  requirements?: string[];
  salaryRange?: string; // e.g. '₹12,000 - ₹18,000 / month'
  jobType: JobType;
  contactMethod: 'PHONE' | 'WHATSAPP' | 'EMAIL' | 'WALK_IN';
  contactValue: string;
  status: JobStatus;
  postedBy: {
    userId: string;
    displayName: string;
    isVerifiedBusiness?: boolean;
  };
  postedAt: string;
  expiresAt: string; // ISO date string
  verifiedAt?: string;
  verifiedBy?: string;
}

export type ProfileMediaStatus = 'VERIFIED' | 'PENDING_REVIEW' | 'FLAGGED' | 'MISSING';

export type ProfileMediaProvenance = 'USER_UPLOAD' | 'USER_URL' | 'ADMIN_VERIFIED' | 'NONE';

export interface ProfileMedia {
  url?: string;
  sourceUrl?: string;
  provenance: ProfileMediaProvenance;
  status: ProfileMediaStatus;
  updatedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface LocalUserProfile {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  profileMedia?: ProfileMedia;
  locality: string; // e.g. 'Ranaghat', 'Birnagar', 'Nadia'
  bio?: string;
  creatorLinks?: CreatorLink[];
  contributionCategories?: string[];
  reputationBadges: ReputationBadge[];
  reputationScore: number; // 0 - 100 calculated from usefulness, accuracy, consistency, not followers
  stats: LocalIdentityStats;
  explanation: string; // Transparent reason: why this person has this reputation
  joinedDate: string;
  isVerifiedResident?: boolean;
  verificationStatus?: VerificationProposalStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  phone?: string;
}

export type ContributionType =
  | 'DISCOVER'
  | 'INFORM'
  | 'RECOMMEND'
  | 'UPDATE'
  | 'REPORT'
  | 'REVIEW'
  | 'EVENT'
  | 'STORY'
  | 'QUESTION'
  | 'CORRECTION'
  | 'SUGGESTION';

export type ContributionProvenance =
  | 'FIRST_HAND_CITIZEN'
  | 'COMMUNITY_OBSERVATION'
  | 'OFFICIAL_NOTICE'
  | 'FIELD_VERIFIED'
  | 'BUSINESS_PROPRIETOR';

export type ContributionVerificationState =
  | 'UNVERIFIED'
  | 'COMMUNITY_CORROBORATED'
  | 'OFFICIALLY_VERIFIED'
  | 'DISPUTED';

export interface ContributionTrustDossier {
  whatWeKnow: string;
  whyWeKnowIt: string;
  source: string;
  lastCheckedDate: string;
  whatCommunitySays: string;
  whatRemainsUncertain: string;
}

export interface ContributionMediaItem {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO';
  url: string;
  externalUrl?: string;
  platform?: 'YOUTUBE' | 'VIMEO' | 'INSTAGRAM' | 'FACEBOOK' | 'DIRECT';
  caption?: string;
}

export interface LocalContribution {
  id: string;
  type: ContributionType;
  title: string;
  content: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    locality: string;
    badge?: ReputationBadge;
  };
  locality: string; // e.g. 'ranaghat', 'birnagar', 'santipur'
  businessRef?: {
    id: string;
    name: string;
    slug: string;
    category?: string;
  };
  placeRef?: {
    id: string;
    name: string;
    category?: string;
  };
  eventRef?: {
    title: string;
    date: string;
    time?: string;
    location?: string;
  };
  media?: ContributionMediaItem[];
  externalPostUrl?: string;
  category: string;
  provenance: ContributionProvenance;
  sourceName?: string;
  sourceUrl?: string;
  verificationState: ContributionVerificationState;
  trustDossier: ContributionTrustDossier;
  confirmationsCount: number;
  disputesCount: number;
  ratingsCount: number;
  averageRating: number;
  commentsCount: number;
  status: 'PUBLISHED' | 'PENDING_MODERATION' | 'FLAGGED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  lastCheckedAt: string;
}

export type SignalType =
  | 'BUSINESS_MENTION'
  | 'BUSINESS_RECOMMENDATION'
  | 'BUSINESS_UPDATE'
  | 'BUSINESS_CORRECTION'
  | 'LOCAL_UPDATE'
  | 'PLACE_DISCOVERY'
  | 'EVENT_SUBMISSION'
  | 'COMMUNITY_CONFIRMATION'
  | 'COMMUNITY_DISPUTE'
  | 'CONTENT_RATING'
  | 'INFORMATION_CORRECTION'
  | 'BUSINESS_REQUEST'
  | 'LOCAL_NEWS_SIGNAL'
  | 'CREATOR_CONTRIBUTION'
  | 'PLACE_RECOMMENDATION';

export interface LocalSignal {
  id: string;
  signalType: SignalType;
  actor: {
    userId: string;
    displayName: string;
  };
  sourceContributionId?: string;
  targetEntityId?: string;
  targetEntityType: 'BUSINESS' | 'PLACE' | 'EVENT' | 'LOCALITY' | 'SYSTEM';
  targetEntityName: string;
  locality: string;
  confidence: number; // 0 - 100
  status: 'ACTIVE' | 'EVALUATED' | 'DISPUTED' | 'SUPERSEDED';
  supportingEvidence: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type MomentType =
  | 'FESTIVAL'
  | 'INFRASTRUCTURE'
  | 'COMMERCIAL'
  | 'CULTURAL'
  | 'PUBLIC_NOTICE'
  | 'EVENT';

export interface LocalMoment {
  id: string;
  title: string;
  summary: string;
  locality: string;
  momentType: MomentType;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  startDate: string;
  endDate?: string;
  locationName: string;
  coordinates?: { latitude: number; longitude: number };
  relatedBusinessIds?: string[];
  relatedPlaceNames?: string[];
  contributionsCount: number;
  confirmationsCount: number;
  verifiedSource?: string;
  tags: string[];
  createdAt: string;
}

export interface LocalPlace {
  id: string;
  name: string;
  locality: string;
  category: 'TRANSPORT_HUB' | 'MARKET' | 'LANDMARK' | 'EDUCATION' | 'HEALTHCARE' | 'RELIGIOUS' | 'PARK' | 'COMMERCIAL_CORRIDOR';
  address: string;
  landmark?: string;
  description: string;
  coordinates?: { latitude: number; longitude: number };
}

export interface BusinessDemandRequest {
  id: string;
  businessName: string;
  locality: string;
  category?: string;
  addressHint?: string;
  sourceUrl?: string;
  reason?: string;
  requestedBy: {
    userId?: string;
    displayName: string;
    email?: string;
  };
  status: 'PENDING_REVIEW' | 'ONBOARDING' | 'FULFILLED' | 'REJECTED';
  notes?: string;
  createdAt: string;
}

export interface ContributionComment {
  id: string;
  contributionId: string;
  userId: string;
  userDisplayName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface ContributionRating {
  id: string;
  contributionId: string;
  userId: string;
  rating: number; // 1 - 5
  createdAt: string;
}

export interface UserFollow {
  id: string;
  followerUserId: string;
  targetId: string;
  targetType: 'USER' | 'BUSINESS' | 'PLACE' | 'TOPIC';
  targetName: string;
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  targetId: string;
  targetType: 'CONTRIBUTION' | 'COMMENT' | 'USER' | 'BUSINESS_CLAIM';
  reason: 'MISINFORMATION' | 'SPAM' | 'HARASSMENT' | 'FALSE_BUSINESS_CLAIM' | 'INAPPROPRIATE' | 'OTHER';
  details: string;
  reportedByUserId: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';
  actionTaken?: string;
  createdAt: string;
}
