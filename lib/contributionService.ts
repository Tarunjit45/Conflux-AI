// Conflux Platform — User Contribution Service (Remote Supabase PostgreSQL Engine & Moderation)

import { supabase, isSupabaseConfigured } from './supabase.ts';
import type {
  UserContribution,
  ReviewRatingContribution,
  SuggestedEditContribution,
  InaccuracyReportContribution,
  ModerationStatus,
  InaccuracyIssueType
} from '../types/contribution.ts';

// Test/Development Memory Cache
let memoryContributions: UserContribution[] = [];

const isValidUuid = (str: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class ContributionService {
  /**
   * Clear in-memory contributions (for test suites)
   */
  clearStore() {
    memoryContributions = [];
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
    if (!userId || !userEmail || userId.trim() === '' || userEmail.trim() === '') {
      throw new Error('AUTHENTICATION_REQUIRED: You must be logged into an authenticated account to submit a review.');
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5 stars.');
    }
    if (!reviewText || reviewText.trim().length < 10) {
      throw new Error('Review text is required (minimum 10 characters explaining your customer experience).');
    }

    const allExisting = await this.getAllContributions();
    const existing = allExisting.find(c =>
      c.contributionType === 'REVIEW_RATING' &&
      c.businessId === businessId &&
      c.userId === userId
    );
    if (existing) {
      throw new Error('You have already submitted a review for this business entity.');
    }

    const newReview: ReviewRatingContribution = {
      id: generateUuid(),
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

    if (isSupabaseConfigured() && isValidUuid(businessId)) {
      try {
        const { error } = await supabase.from('user_contributions').insert([{
          id: newReview.id,
          business_id: newReview.businessId,
          business_name: newReview.businessName,
          user_id: newReview.userId,
          user_email: newReview.userEmail,
          user_display_name: newReview.userDisplayName,
          contribution_type: newReview.contributionType,
          rating: newReview.rating,
          review_text: newReview.reviewText,
          moderation_status: newReview.moderationStatus,
          created_at: newReview.createdAt
        }]);
        if (error) {
          console.warn('[ContributionService.submitReview] Supabase insert warning:', error.message);
        }
      } catch (err: any) {
        console.warn('[ContributionService.submitReview] Database error:', err?.message || err);
      }
    }

    memoryContributions.unshift(newReview);
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

    const newEdit: SuggestedEditContribution = {
      id: generateUuid(),
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

    if (isSupabaseConfigured() && isValidUuid(businessId)) {
      try {
        const { error } = await supabase.from('user_contributions').insert([{
          id: newEdit.id,
          business_id: newEdit.businessId,
          business_name: newEdit.businessName,
          user_id: newEdit.userId,
          user_email: newEdit.userEmail,
          user_display_name: newEdit.userDisplayName,
          contribution_type: newEdit.contributionType,
          field_name: newEdit.fieldName,
          suggested_value: newEdit.suggestedValue,
          rationale: newEdit.rationale,
          moderation_status: newEdit.moderationStatus,
          created_at: newEdit.createdAt
        }]);
        if (error) {
          console.warn('[ContributionService.submitSuggestedEdit] Supabase insert warning:', error.message);
        }
      } catch (err: any) {
        console.warn('[ContributionService.submitSuggestedEdit] Database error:', err?.message || err);
      }
    }

    memoryContributions.unshift(newEdit);
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

    const newReport: InaccuracyReportContribution = {
      id: generateUuid(),
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

    if (isSupabaseConfigured() && isValidUuid(businessId)) {
      try {
        const { error } = await supabase.from('user_contributions').insert([{
          id: newReport.id,
          business_id: newReport.businessId,
          business_name: newReport.businessName,
          user_id: newReport.userId,
          user_email: newReport.userEmail,
          user_display_name: newReport.userDisplayName,
          contribution_type: newReport.contributionType,
          issue_type: newReport.issueType,
          details: newReport.details,
          moderation_status: newReport.moderationStatus,
          created_at: newReport.createdAt
        }]);
        if (error) {
          console.warn('[ContributionService.submitInaccuracyReport] Supabase insert warning:', error.message);
        }
      } catch (err: any) {
        console.warn('[ContributionService.submitInaccuracyReport] Database error:', err?.message || err);
      }
    }

    memoryContributions.unshift(newReport);
    return newReport;
  }

  /**
   * Get Approved Reviews for Public Profile View
   */
  async getApprovedReviewsForBusiness(businessId: string): Promise<ReviewRatingContribution[]> {
    let list: ReviewRatingContribution[] = [];
    if (isSupabaseConfigured() && isValidUuid(businessId)) {
      try {
        const { data, error } = await supabase
          .from('user_contributions')
          .select('*')
          .eq('business_id', businessId)
          .eq('contribution_type', 'REVIEW_RATING')
          .eq('moderation_status', 'APPROVED')
          .order('created_at', { ascending: false });

        if (!error && data) {
          list = data.map(row => ({
            id: row.id,
            businessId: row.business_id,
            businessName: row.business_name,
            userId: row.user_id,
            userDisplayName: row.user_display_name,
            userEmail: row.user_email,
            contributionType: 'REVIEW_RATING',
            rating: row.rating,
            reviewText: row.review_text,
            moderationStatus: 'APPROVED',
            adminNotes: row.admin_notes,
            reviewedAt: row.reviewed_at,
            createdAt: row.created_at
          }));
        }
      } catch (err: any) {
        console.warn('[ContributionService.getApprovedReviewsForBusiness] Database error:', err?.message || err);
      }
    }

    const memList = memoryContributions.filter((c): c is ReviewRatingContribution =>
      c.businessId === businessId &&
      c.contributionType === 'REVIEW_RATING' &&
      c.moderationStatus === 'APPROVED'
    );

    const existingIds = new Set(list.map(r => r.id));
    memList.forEach(m => {
      if (!existingIds.has(m.id)) list.push(m);
    });

    return list;
  }

  /**
   * Get All Contributions for Admin Queue
   */
  async getAllContributions(): Promise<UserContribution[]> {
    let list: UserContribution[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_contributions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          list = data.map(row => ({
            id: row.id,
            businessId: row.business_id,
            businessName: row.business_name,
            userId: row.user_id,
            userDisplayName: row.user_display_name,
            userEmail: row.user_email,
            contributionType: row.contribution_type,
            rating: row.rating,
            reviewText: row.review_text,
            fieldName: row.field_name,
            suggestedValue: row.suggested_value,
            rationale: row.rationale,
            issueType: row.issue_type,
            details: row.details,
            moderationStatus: row.moderation_status,
            adminNotes: row.admin_notes,
            reviewedAt: row.reviewed_at,
            createdAt: row.created_at
          }));
        }
      } catch (err: any) {
        console.warn('[ContributionService.getAllContributions] Database error:', err?.message || err);
      }
    }

    const existingIds = new Set(list.map(c => c.id));
    memoryContributions.forEach(m => {
      if (!existingIds.has(m.id)) list.push(m);
    });

    return list;
  }

  /**
   * Admin: Moderate Contribution (Approve or Reject)
   */
  async moderateContribution(
    contributionId: string,
    status: ModerationStatus,
    adminNotes?: string
  ): Promise<UserContribution> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('user_contributions')
          .update({
            moderation_status: status,
            admin_notes: adminNotes,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', contributionId);

        if (error) throw error;
      } catch (err: any) {
        console.error('[ContributionService.moderateContribution] Database error:', err);
        throw err;
      }
    }

    const idx = memoryContributions.findIndex(c => c.id === contributionId);
    if (idx !== -1) {
      memoryContributions[idx].moderationStatus = status;
      memoryContributions[idx].adminNotes = adminNotes;
      memoryContributions[idx].reviewedAt = new Date().toISOString();
      return memoryContributions[idx];
    }

    const all = await this.getAllContributions();
    const match = all.find(c => c.id === contributionId);
    if (!match) throw new Error(`Contribution ${contributionId} not found.`);
    return { ...match, moderationStatus: status, adminNotes };
  }
}

export const contributionService = new ContributionService();
