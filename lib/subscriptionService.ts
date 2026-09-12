// Conflux Platform — Commercial Subscription & Entitlements Engine

import { supabase } from './supabase.ts';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessSubscription, BusinessEntitlements, PlanTier, SubscriptionStatus } from '../types/subscription.ts';
import { CONFLUX_PLANS } from '../types/subscription.ts';

export class SubscriptionService {
  private isDedicatedTableAvailable: boolean | null = null;

  /**
   * Derive technical feature entitlements from subscription state
   * Rules:
   * 1. Must have status 'ACTIVE' or 'TRIAL'
   * 2. Must not be expired (if expiresAt is set)
   * 3. Plan must be a paid tier ('VERIFIED_GROWTH', 'REGIONAL_SCALE', 'ENTERPRISE')
   * Note: Commercial paid status NEVER implies statutory verification (which is verified separately).
   */
  evaluateEntitlements(sub: BusinessSubscription): BusinessEntitlements {
    const now = new Date();
    const isExpired = sub.expiresAt ? new Date(sub.expiresAt) < now : false;
    const isPlanActive = (sub.status === 'ACTIVE' || sub.status === 'TRIAL') && !isExpired;
    const isPaid = isPlanActive && sub.plan !== 'FREE';

    return {
      businessId: sub.businessId,
      isPaid,
      plan: sub.plan,
      status: isExpired ? 'PAST_DUE' : sub.status,
      expiresAt: sub.expiresAt,
      features: {
        // Direct Lead Forwarding: Instant real-time routing to owner email/phone
        directLeadForwarding: isPaid,
        // Direct Action CTAs: 1-tap WhatsApp and direct calling buttons prominently featured
        directActionCtas: isPaid,
        // Analytics Reporting: Access to views, call clicks, and lead breakdown
        analyticsReporting: isPaid,
        // Partner Badge: Commercial growth designation (strictly distinct from statutory verification)
        partnerBadge: isPaid,
        // Showcase Media: Extended storefront photo showcase
        customShowcaseMedia: isPaid
      }
    };
  }

  /**
   * Retrieve active subscription for a business from Supabase
   * Reads from dedicated business_subscriptions table (when provisioned), falling back gracefully to businesses.verification_breakdown.subscription
   */
  async getBusinessSubscription(businessId: string, client?: SupabaseClient, businessObj?: any): Promise<BusinessSubscription> {
    const db = client || supabase;
    const defaultFree: BusinessSubscription = {
      businessId,
      plan: 'FREE',
      status: 'INACTIVE',
      billingCycle: 'MONTHLY',
      amountInr: 0,
      activatedAt: null,
      expiresAt: null,
      autoRenew: false
    };

    if (!businessId) return defaultFree;

    // 0. High-performance shortcut: if business object is already in memory, check embedded subscription breakdown
    if (businessObj?.verificationBreakdown?.subscription) {
      return {
        ...defaultFree,
        ...businessObj.verificationBreakdown.subscription,
        businessId
      };
    }

    // If businessObj is provided and has no subscription, and dedicated table is known not to exist, return default free immediately
    if (businessObj && !businessObj.verificationBreakdown?.subscription && this.isDedicatedTableAvailable === false) {
      return defaultFree;
    }

    try {
      // 1. Check dedicated business_subscriptions table only if not previously confirmed missing
      if (this.isDedicatedTableAvailable !== false) {
        const { data: subData, error: subError } = await db
          .from('business_subscriptions')
          .select('*')
          .eq('business_id', businessId)
          .maybeSingle();

        if (subError) {
          if (subError.code === 'PGRST205' || subError.message?.includes('schema cache')) {
            // PostgREST 404: Table not yet provisioned in Supabase schema cache
            this.isDedicatedTableAvailable = false;
          }
        } else if (subData) {
          this.isDedicatedTableAvailable = true;
          return {
            id: subData.id,
            businessId: subData.business_id,
            plan: subData.plan as PlanTier,
            status: subData.status as SubscriptionStatus,
            billingCycle: subData.billing_cycle || 'MONTHLY',
            amountInr: Number(subData.amount_inr) || 0,
            activatedAt: subData.activated_at,
            expiresAt: subData.expires_at,
            autoRenew: Boolean(subData.auto_renew),
            paymentProvider: subData.payment_provider,
            paymentReference: subData.payment_reference,
            createdAt: subData.created_at,
            updatedAt: subData.updated_at
          };
        }
      }

      // 2. Check businesses.verification_breakdown.subscription in public.businesses
      const { data: bizData } = await db
        .from('businesses')
        .select('verification_breakdown')
        .eq('id', businessId)
        .maybeSingle();

      if (bizData?.verification_breakdown?.subscription) {
        const stored = bizData.verification_breakdown.subscription;
        return {
          ...defaultFree,
          ...stored,
          businessId
        };
      }
    } catch (err) {
      console.warn('[SubscriptionService.getBusinessSubscription] Non-fatal query notice, returning default free:', err);
    }

    return defaultFree;
  }

  /**
   * Retrieve evaluated entitlements for a business
   */
  async getBusinessEntitlements(businessId: string, client?: SupabaseClient, businessObj?: any): Promise<BusinessEntitlements> {
    const sub = await this.getBusinessSubscription(businessId, client, businessObj);
    return this.evaluateEntitlements(sub);
  }

  /**
   * Update or activate a business subscription
   * Designed so a future payment webhook (Razorpay / Stripe) or Admin can activate entitlements safely.
   */
  async updateBusinessSubscription(params: {
    businessId: string;
    plan: PlanTier;
    status: SubscriptionStatus;
    billingCycle?: 'MONTHLY' | 'ANNUAL' | 'LIFETIME';
    amountInr?: number;
    paymentProvider?: 'OFFLINE_MANUAL' | 'RAZORPAY' | 'BANK_TRANSFER' | 'TRIAL_GRANT';
    paymentReference?: string;
    durationDays?: number;
    autoRenew?: boolean;
    client?: SupabaseClient;
  }): Promise<BusinessSubscription> {
    const {
      businessId,
      plan,
      status,
      billingCycle = 'MONTHLY',
      paymentProvider = 'OFFLINE_MANUAL',
      paymentReference,
      durationDays = 30,
      autoRenew = false,
      client
    } = params;

    const db = client || supabase;
    const planConfig = CONFLUX_PLANS[plan] || CONFLUX_PLANS.FREE;
    const amountInr = params.amountInr !== undefined
      ? params.amountInr
      : (billingCycle === 'ANNUAL' ? planConfig.annualAmountInr : planConfig.monthlyAmountInr);

    const now = new Date();
    const activatedAt = status === 'ACTIVE' ? now.toISOString() : null;
    const expiresAt = status === 'ACTIVE'
      ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const subRecord: BusinessSubscription = {
      businessId,
      plan,
      status,
      billingCycle,
      amountInr,
      activatedAt,
      expiresAt,
      autoRenew,
      paymentProvider,
      paymentReference: paymentReference || `MANUAL-${Date.now()}`,
      updatedAt: now.toISOString()
    };

    // 1. Attempt write to business_subscriptions table if exists
    if (this.isDedicatedTableAvailable !== false) {
      try {
        const { data: upsertData, error: upsertErr } = await db
          .from('business_subscriptions')
          .upsert([{
            business_id: businessId,
            plan,
            status,
            billing_cycle: billingCycle,
            amount_inr: amountInr,
            activated_at: activatedAt,
            expires_at: expiresAt,
            auto_renew: autoRenew,
            payment_provider: paymentProvider,
            payment_reference: subRecord.paymentReference,
            updated_at: now.toISOString()
          }], { onConflict: 'business_id' })
          .select()
          .maybeSingle();

        if (!upsertErr && upsertData) {
          this.isDedicatedTableAvailable = true;
          return {
            ...subRecord,
            id: upsertData.id,
            createdAt: upsertData.created_at
          };
        } else if (upsertErr?.code === 'PGRST205') {
          this.isDedicatedTableAvailable = false;
        }
      } catch {
        this.isDedicatedTableAvailable = false;
      }
    }

    // 2. Persist safely in public.businesses.verification_breakdown.subscription
    try {
      const { data: currentBiz } = await db
        .from('businesses')
        .select('verification_breakdown')
        .eq('id', businessId)
        .single();

      const existingBreakdown = currentBiz?.verification_breakdown || {};
      const updatedBreakdown = {
        ...existingBreakdown,
        subscription: subRecord
      };

      const { error: updateErr } = await db
        .from('businesses')
        .update({
          verification_breakdown: updatedBreakdown,
          updated_at: now.toISOString()
        })
        .eq('id', businessId);

      if (updateErr) {
        console.error('[SubscriptionService.updateBusinessSubscription] Failed to persist subscription to businesses:', updateErr);
        throw new Error(`[DATABASE_ERROR] Could not save subscription: ${updateErr.message}`);
      }
    } catch (err: any) {
      console.error('[SubscriptionService.updateBusinessSubscription] Critical failure:', err);
      throw err;
    }

    return subRecord;
  }
}

export const subscriptionService = new SubscriptionService();
