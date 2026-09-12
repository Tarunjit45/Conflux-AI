-- ── 005: CONFLUX PAID PLANS, SUBSCRIPTIONS & VALUE ENTITLEMENTS ─────────────
-- Authoritative schema for commercial business plans, payments, and entitlements.
-- NOTE: Commercial plan status is strictly orthogonal to statutory verification.

CREATE TABLE IF NOT EXISTS public.business_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'VERIFIED_GROWTH', 'REGIONAL_SCALE', 'ENTERPRISE')),
    status TEXT NOT NULL DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED')),
    billing_cycle TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('MONTHLY', 'ANNUAL', 'LIFETIME')),
    amount_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
    payment_provider TEXT DEFAULT 'OFFLINE_MANUAL',
    payment_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_business_subscription UNIQUE (business_id)
);

ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;

-- Public can view subscription tier of active businesses (e.g. for displaying partner badges)
DROP POLICY IF EXISTS "Public can view business subscriptions" ON public.business_subscriptions;
CREATE POLICY "Public can view business subscriptions"
    ON public.business_subscriptions FOR SELECT
    USING (true);

-- Business owners can view their own subscription
DROP POLICY IF EXISTS "Business owners can view own subscription" ON public.business_subscriptions;
CREATE POLICY "Business owners can view own subscription"
    ON public.business_subscriptions FOR SELECT
    USING (
        public.is_admin() OR
        EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
    );

-- Only platform admins or secure webhooks (service_role) can mutate subscriptions
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.business_subscriptions;
CREATE POLICY "Admins can manage subscriptions"
    ON public.business_subscriptions FOR ALL
    USING (public.is_admin());

-- Index for fast lookup by business_id and active status
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_lookup 
    ON public.business_subscriptions(business_id, status);
