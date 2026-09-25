-- ==============================================================================
-- 007: CONFLUX TRANSACTIONAL EMAIL & NOTIFICATION EVENT LOGS
-- Core Invariant: Factual transactional logging; strict admin-only visibility;
-- separation of critical transactional emails from optional marketing emails.
-- ==============================================================================

-- 1. Email Delivery & Event Audit Log Table
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    entity_id TEXT, -- orderId, businessSlug, or userId
    status TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN (
        'SENT', 'FAILED', 'SKIPPED_DUPLICATE', 'SKIPPED_PREFERENCE', 'SANDBOX'
    )),
    provider TEXT NOT NULL DEFAULT 'resend',
    provider_message_id TEXT,
    idempotency_key TEXT UNIQUE,
    retry_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    category TEXT NOT NULL DEFAULT 'TRANSACTIONAL' CHECK (category IN (
        'TRANSACTIONAL', 'MARKETING'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Operational indexes for admin querying & idempotency lookup
CREATE INDEX IF NOT EXISTS idx_email_logs_idempotency ON public.email_logs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_email_logs_event_type ON public.email_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_entity_id ON public.email_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Security Policy: Strictly Admin-Only Access (Zero public exposure of customer email logs)
DROP POLICY IF EXISTS "Admins can view and manage email logs" ON public.email_logs;
CREATE POLICY "Admins can view and manage email logs"
    ON public.email_logs FOR ALL
    USING (public.is_admin());

-- 2. User Email Preferences (Transactional vs Optional Marketing)
CREATE TABLE IF NOT EXISTS public.user_email_preferences (
    email TEXT PRIMARY KEY,
    allow_marketing BOOLEAN NOT NULL DEFAULT FALSE,
    allow_community_updates BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_email_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own email preferences" ON public.user_email_preferences;
CREATE POLICY "Users can read own email preferences"
    ON public.user_email_preferences FOR SELECT
    USING (
        public.is_admin() OR
        (auth.jwt() ->> 'email' IS NOT NULL AND email = auth.jwt() ->> 'email')
    );

DROP POLICY IF EXISTS "Users can update own email preferences" ON public.user_email_preferences;
CREATE POLICY "Users can update own email preferences"
    ON public.user_email_preferences FOR ALL
    USING (
        public.is_admin() OR
        (auth.jwt() ->> 'email' IS NOT NULL AND email = auth.jwt() ->> 'email')
    );
