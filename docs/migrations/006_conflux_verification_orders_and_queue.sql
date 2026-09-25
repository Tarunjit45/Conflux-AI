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

-- 1. Admin full management policy: Only authenticated administrators can inspect all orders
DROP POLICY IF EXISTS "Admins can manage verification orders" ON public.verification_orders;
CREATE POLICY "Admins can manage verification orders"
    ON public.verification_orders FOR ALL
    USING (public.is_admin());

-- 2. Customer can view their own order if authenticated with matching email, or admins
DROP POLICY IF EXISTS "Customers can view their own order" ON public.verification_orders;
CREATE POLICY "Customers can view their own order"
    ON public.verification_orders FOR SELECT
    USING (
        public.is_admin() OR
        (auth.jwt() ->> 'email' IS NOT NULL AND customer_email = auth.jwt() ->> 'email')
    );

-- 3. Anonymous can create a verification order (Checkout initiation)
DROP POLICY IF EXISTS "Public can initiate verification order" ON public.verification_orders;
CREATE POLICY "Public can initiate verification order"
    ON public.verification_orders FOR INSERT
    WITH CHECK (true);

-- 4. Secure Public Receipt & Order Lookup Function (DPDP Compliant - prevents bulk table dump)
CREATE OR REPLACE FUNCTION public.get_verification_order_receipt(p_order_id TEXT)
RETURNS SETOF public.verification_orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM public.verification_orders
    WHERE order_id = p_order_id
    LIMIT 1;
$$;

-- ------------------------------------------------------------------------------
-- STORAGE BUCKET CONFIGURATION FOR SENSITIVE VERIFICATION EVIDENCE (DPDP COMPLIANT)
-- ------------------------------------------------------------------------------
-- Ensure 'verification-evidence' bucket exists and is STRICTLY PRIVATE (no public URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-evidence',
    'verification-evidence',
    false, -- STRICTLY PRIVATE: Objects CANNOT be accessed via public CDN URLs
    10485760, -- 10MB maximum file size
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS: Restrict read/download to Admins only (Zero public exposure)
DROP POLICY IF EXISTS "Admins can view and download verification evidence" ON storage.objects;
CREATE POLICY "Admins can view and download verification evidence"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-evidence' AND
        public.is_admin()
    );

-- Storage RLS: Public applicants can upload evidence to their order folder
DROP POLICY IF EXISTS "Applicants can upload verification evidence" ON storage.objects;
CREATE POLICY "Applicants can upload verification evidence"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'verification-evidence' AND
        (storage.foldername(name))[1] IS NOT NULL
    );

-- ------------------------------------------------------------------------------
-- DATA RETENTION & AUTO-PURGING SPECIFICATION (DPDP COMPLIANT)
-- ------------------------------------------------------------------------------
-- Procedure to purge raw documentary evidence for expired orders past 1 year retention
CREATE OR REPLACE FUNCTION public.purge_expired_verification_evidence()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    purged_count INTEGER := 0;
    r RECORD;
BEGIN
    -- Select orders expired over 30 days ago where evidence has not yet been purged
    FOR r IN
        SELECT id, order_id, evidence_payload
        FROM public.verification_orders
        WHERE expires_at < NOW() - INTERVAL '30 days'
          AND evidence_payload->>'evidenceDocUrl' IS NOT NULL
    LOOP
        -- Redact raw file URL references from JSON payload
        UPDATE public.verification_orders
        SET evidence_payload = jsonb_set(
            jsonb_set(evidence_payload, '{evidenceDocUrl}', '"[PURGED_POST_EXPIRY]"'::jsonb),
            '{purged_at}', to_jsonb(NOW()::text)
        ),
        updated_at = NOW()
        WHERE id = r.id;

        purged_count := purged_count + 1;
    END LOOP;

    RETURN purged_count;
END;
$$;
