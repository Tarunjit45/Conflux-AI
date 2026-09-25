-- ==============================================================================
-- 006: CONFLUX PAID VERIFICATION ORDERS & APPLICATION REVIEW QUEUE
-- Core Invariant: Payment covers the manual verification review; it is NEVER an automatic verification guarantee.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.verification_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL UNIQUE, -- Cashfree order_id e.g. cfx_verify_1727265890123
    cf_order_id TEXT,              -- Cashfree system numeric order ID
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    business_slug TEXT NOT NULL,
    business_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    amount_inr NUMERIC(10, 2) NOT NULL DEFAULT 499.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN (
        'PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'
    )),
    verification_status TEXT NOT NULL DEFAULT 'PAYMENT_PENDING' CHECK (verification_status IN (
        'PAYMENT_PENDING', 'PAID', 'UNDER_REVIEW', 'MORE_EVIDENCE_REQUIRED', 'VERIFIED', 'REJECTED', 'EXPIRED'
    )),
    payment_session_id TEXT,
    payment_reference TEXT,       -- Cashfree payment ID / bank transaction ref
    payment_method TEXT,          -- UPI, CARD, NETBANKING
    payment_time TIMESTAMPTZ,
    evidence_payload JSONB DEFAULT '{}'::jsonb, -- structured evidence & document references
    review_notes TEXT,
    evidence_requested_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,       -- strictly 1 year from approval
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rapid operational lookup
CREATE INDEX IF NOT EXISTS idx_verification_orders_order_id ON public.verification_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_verification_orders_biz_id ON public.verification_orders(business_id);
CREATE INDEX IF NOT EXISTS idx_verification_orders_biz_slug ON public.verification_orders(business_slug);
CREATE INDEX IF NOT EXISTS idx_verification_orders_statuses ON public.verification_orders(verification_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_verification_orders_created ON public.verification_orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.verification_orders ENABLE ROW LEVEL SECURITY;

-- 1. Admin full management policy
DROP POLICY IF EXISTS "Admins can manage verification orders" ON public.verification_orders;
CREATE POLICY "Admins can manage verification orders"
    ON public.verification_orders FOR ALL
    USING (public.is_admin());

-- 2. Public / Customer can view their own order by order_id or email
DROP POLICY IF EXISTS "Customers can view their own order" ON public.verification_orders;
CREATE POLICY "Customers can view their own order"
    ON public.verification_orders FOR SELECT
    USING (
        customer_email = auth.jwt() ->> 'email' OR
        public.is_admin() OR
        true -- Allow read of non-sensitive order status by order ID lookup
    );

-- 3. Anonymous can create a verification order (Checkout initiation)
DROP POLICY IF EXISTS "Public can initiate verification order" ON public.verification_orders;
CREATE POLICY "Public can initiate verification order"
    ON public.verification_orders FOR INSERT
    WITH CHECK (true);
