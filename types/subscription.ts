// Conflux Platform — Commercial Plan, Subscription & Business Entitlement Types

export type PlanTier = 'FREE' | 'VERIFIED_GROWTH' | 'REGIONAL_SCALE' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED';
export type BillingCycle = 'MONTHLY' | 'ANNUAL' | 'LIFETIME';

export interface PlanPricing {
  tier: PlanTier;
  name: string;
  monthlyAmountInr: number;
  annualAmountInr: number;
  description: string;
  highlightedFeatures: string[];
}

export const CONFLUX_PLANS: Record<PlanTier, PlanPricing> = {
  FREE: {
    tier: 'FREE',
    name: 'Directory Free',
    monthlyAmountInr: 0,
    annualAmountInr: 0,
    description: 'Basic local business listing and standard search indexability across district corridors.',
    highlightedFeatures: [
      'Indexed public directory profile',
      'Basic contact address & opening hours',
      'Inbound inquiry capture form (batched)',
      'Statutory verification review eligibility'
    ]
  },
  VERIFIED_GROWTH: {
    tier: 'VERIFIED_GROWTH',
    name: 'Verified Growth Partner',
    monthlyAmountInr: 1499,
    annualAmountInr: 14990,
    description: 'Direct customer lead forwarding, 1-tap WhatsApp conversion, and business activity telemetry.',
    highlightedFeatures: [
      'Instant direct lead forwarding (Email & WhatsApp alert)',
      'Prominent 1-tap WhatsApp & Phone Click CTAs',
      'Real-time Customer Activity Telemetry & Leads Ledger',
      'Commercial Growth Partner profile designation',
      'Extended multi-photo storefront showcase'
    ]
  },
  REGIONAL_SCALE: {
    tier: 'REGIONAL_SCALE',
    name: 'Regional Scale',
    monthlyAmountInr: 3499,
    annualAmountInr: 34990,
    description: 'Multi-locality visibility, cross-district service corridors, and priority inquiry routing.',
    highlightedFeatures: [
      'All Verified Growth features',
      'Multi-hub district directory presence',
      'Granular capability search prioritization',
      'Monthly search performance reporting docket'
    ]
  },
  ENTERPRISE: {
    tier: 'ENTERPRISE',
    name: 'Custom Enterprise / Health Network',
    monthlyAmountInr: 9999,
    annualAmountInr: 99990,
    description: 'Bespoke multi-branch hospital, diagnostic chain, or manufacturing conglomerate integration.',
    highlightedFeatures: [
      'Multi-branch corporate entity graph',
      'Dedicated compliance docket review',
      'Direct API webhook lead dispatch',
      'Executive quarterly performance reviews'
    ]
  }
};

export interface BusinessSubscription {
  id?: string;
  businessId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amountInr: number;
  activatedAt?: string | null;
  expiresAt?: string | null;
  autoRenew: boolean;
  paymentProvider?: 'OFFLINE_MANUAL' | 'RAZORPAY' | 'BANK_TRANSFER' | 'TRIAL_GRANT';
  paymentReference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessEntitlements {
  businessId: string;
  isPaid: boolean;
  plan: PlanTier;
  status: SubscriptionStatus;
  expiresAt?: string | null;
  features: {
    directLeadForwarding: boolean;
    directActionCtas: boolean;
    analyticsReporting: boolean;
    partnerBadge: boolean;
    customShowcaseMedia: boolean;
  };
}
