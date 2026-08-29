// Conflux Platform — User Contributions & Structured Local Knowledge Types

export type ContributionType = 'REVIEW_RATING' | 'SUGGESTED_EDIT' | 'INACCURACY_REPORT';

export type ModerationStatus = 'PENDING_MODERATION' | 'APPROVED' | 'REJECTED';

export type InaccuracyIssueType =
  | 'CLOSED_PERMANENTLY'
  | 'WRONG_LOCATION'
  | 'WRONG_PHONE'
  | 'OUTDATED_HOURS'
  | 'UNAUTHORIZED_LISTING'
  | 'OTHER';

export interface BaseContribution {
  id: string;
  businessId: string;
  businessName?: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  contributionType: ContributionType;
  moderationStatus: ModerationStatus;
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface ReviewRatingContribution extends BaseContribution {
  contributionType: 'REVIEW_RATING';
  rating: number; // 1 - 5
  reviewText: string;
  visitDate?: string;
  serviceUsed?: string;
}

export interface SuggestedEditContribution extends BaseContribution {
  contributionType: 'SUGGESTED_EDIT';
  fieldName: 'operatingHours' | 'services' | 'contactPhone' | 'address' | 'landmark' | 'other';
  suggestedValue: string;
  rationale: string;
}

export interface InaccuracyReportContribution extends BaseContribution {
  contributionType: 'INACCURACY_REPORT';
  issueType: InaccuracyIssueType;
  details: string;
}

export type UserContribution =
  | ReviewRatingContribution
  | SuggestedEditContribution
  | InaccuracyReportContribution;
