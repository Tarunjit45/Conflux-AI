// Conflux Platform — User Contribution Service (Reviews, Ratings, Edits & Reports)

import type {
  UserContribution,
  ReviewRatingContribution,
  SuggestedEditContribution,
  InaccuracyReportContribution,
  ModerationStatus,
  InaccuracyIssueType
} from '../types/contribution.ts';

const LOCAL_STORAGE_CONTRIBUTIONS_KEY = 'conflux_user_contributions';

export class ContributionService {
  private memoryContributions: UserContribution[] | null = null;

  private getStore(): UserContribution[] {
    if (typeof localStorage === 'undefined') {
      return this.memoryContributions || [];
    }

    const raw = localStorage.getItem(LOCAL_STORAGE_CONTRIBUTIONS_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Storage error guard
    }
    return [];
  }

  private setStore(data: UserContribution[]) {
    this.memoryContributions = data;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_CONTRIBUTIONS_KEY, JSON.stringify(data));
      } catch {
        // Storage quota guard
      }
    }
  }

  /**
   * Submit a Customer Review & Rating (Authentication Required)
   */
  async submitReview(
    userId: string,
    userEmail: string,
    userDisplayName: string,
    businessId: string,
    rating: number,
    reviewText: string,
    options: {
      visitDate?: string;
      serviceUsed?: string;
      businessName?: string;
    } = {}
  ): Promise<ReviewRatingContribution> {
    // 1. Strict Authentication Check
    if (!userId || !userEmail || userId.trim() === '' || userEmail.trim() === '') {
      throw new Error('AUTHENTICATION_REQUIRED: You must be logged into an authenticated account to submit a review.');
    }

    // 2. Rating & Content Validation
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5 stars.');
    }
    if (!reviewText || reviewText.trim().length < 10) {
      throw new Error('Review text is required (minimum 10 characters explaining your customer experience).');
    }

    // 3. Abuse & Duplicate Check
    const store = this.getStore();
    const existing = store.find(c =>
      c.contributionType === 'REVIEW_RATING' &&
      c.businessId === businessId &&
      c.userId === userId
    );

    if (existing) {
      throw new Error('You have already submitted a review for this business entity.');
    }

    const newReview: ReviewRatingContribution = {
      id: `contrib_rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      businessId,
      businessName: options.businessName,
      userId,
      userDisplayName: userDisplayName || userEmail.split('@')[0],
      userEmail,
      contributionType: 'REVIEW_RATING',
      rating,
      reviewText: reviewText.trim(),
      visitDate: options.visitDate,
      serviceUsed: options.serviceUsed,
      moderationStatus: 'PENDING_MODERATION',
      createdAt: new Date().toISOString()
    };

    store.unshift(newReview);
    this.setStore(store);
    return newReview;
  }

  /**
   * Submit a Suggested Edit / Correction (Authentication Required)
   */
  async submitSuggestedEdit(
    userId: string,
    userEmail: string,
    userDisplayName: string,
    businessId: string,
    fieldName: SuggestedEditContribution['fieldName'],
    suggestedValue: string,
    rationale: string,
    businessName?: string
  ): Promise<SuggestedEditContribution> {
    if (!userId || !userEmail) {
      throw new Error('AUTHENTICATION_REQUIRED: You must be signed in to suggest a correction.');
    }
    if (!suggestedValue || suggestedValue.trim().length < 2) {
      throw new Error('Suggested correction value is required.');
    }
    if (!rationale || rationale.trim().length < 5) {
      throw new Error('Please provide the rationale for this suggested edit.');
    }

    const store = this.getStore();
    const newEdit: SuggestedEditContribution = {
      id: `contrib_edit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      businessId,
      businessName,
      userId,
      userDisplayName: userDisplayName || userEmail.split('@')[0],
      userEmail,
      contributionType: 'SUGGESTED_EDIT',
      fieldName,
      suggestedValue: suggestedValue.trim(),
      rationale: rationale.trim(),
      moderationStatus: 'PENDING_MODERATION',
      createdAt: new Date().toISOString()
    };

    store.unshift(newEdit);
    this.setStore(store);
    return newEdit;
  }

  /**
   * Submit an Inaccuracy / Outdated Listing Report (Authentication Required)
   */
  async submitInaccuracyReport(
    userId: string,
    userEmail: string,
    userDisplayName: string,
    businessId: string,
    issueType: InaccuracyIssueType,
    details: string,
    businessName?: string
  ): Promise<InaccuracyReportContribution> {
    if (!userId || !userEmail) {
      throw new Error('AUTHENTICATION_REQUIRED: You must be signed in to report inaccurate listing information.');
    }
    if (!details || details.trim().length < 5) {
      throw new Error('Please provide specific details about the inaccuracy.');
    }

    const store = this.getStore();
    const newReport: InaccuracyReportContribution = {
      id: `contrib_rep_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      businessId,
      businessName,
      userId,
      userDisplayName: userDisplayName || userEmail.split('@')[0],
      userEmail,
      contributionType: 'INACCURACY_REPORT',
      issueType,
      details: details.trim(),
      moderationStatus: 'PENDING_MODERATION',
      createdAt: new Date().toISOString()
    };

    store.unshift(newReport);
    this.setStore(store);
    return newReport;
  }

  /**
   * Get Approved Reviews for Public Profile View
   */
  async getApprovedReviewsForBusiness(businessId: string): Promise<ReviewRatingContribution[]> {
    const store = this.getStore();
    return store.filter((c): c is ReviewRatingContribution =>
      c.businessId === businessId &&
      c.contributionType === 'REVIEW_RATING' &&
      c.moderationStatus === 'APPROVED'
    );
  }

  /**
   * Get All Contributions for Admin Queue
   */
  async getAllContributions(): Promise<UserContribution[]> {
    return this.getStore();
  }

  /**
   * Admin: Moderate Contribution (Approve or Reject)
   */
  async moderateContribution(
    contributionId: string,
    status: ModerationStatus,
    adminNotes?: string
  ): Promise<UserContribution> {
    const store = this.getStore();
    const idx = store.findIndex(c => c.id === contributionId);
    if (idx === -1) {
      throw new Error(`Contribution ${contributionId} not found.`);
    }

    store[idx].moderationStatus = status;
    store[idx].adminNotes = adminNotes;
    store[idx].reviewedAt = new Date().toISOString();

    this.setStore(store);
    return store[idx];
  }
}

export const contributionService = new ContributionService();
