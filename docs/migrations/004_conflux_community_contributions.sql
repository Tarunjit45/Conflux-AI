-- ==============================================================================
-- CONFLUX PLATFORM — COMMUNITY CONTRIBUTIONS & LOCAL KNOWLEDGE (MIGRATION 004)
-- Framework: Supabase / PostgreSQL 15+
-- Security: Strict Multi-Device Row Level Security (RLS) + Moderation Architecture
-- Pipeline: CITIZEN → CONTRIBUTIONS → VERIFICATION GATE → SHARED COMMUNITY FEED
-- ==============================================================================

-- ── 1. COMMUNITY CONTRIBUTIONS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_contributions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN (
        'DISCOVER', 'INFORM', 'RECOMMEND', 'UPDATE', 'REPORT', 
        'REVIEW', 'EVENT', 'STORY', 'QUESTION', 'CORRECTION', 'SUGGESTION'
    )),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    locality TEXT NOT NULL, -- normalized, e.g. 'ranaghat'
    author_id TEXT NOT NULL,
    author_display_name TEXT NOT NULL,
    author_avatar_url TEXT,
    author_locality TEXT,
    author_badge TEXT DEFAULT 'LOCAL_CONTRIBUTOR',
    business_id TEXT,
    business_name TEXT,
    business_slug TEXT,
    business_category TEXT,
    place_id TEXT,
    place_name TEXT,
    place_category TEXT,
    event_ref JSONB,
    media JSONB NOT NULL DEFAULT '[]'::jsonb,
    external_post_url TEXT,
    category TEXT NOT NULL DEFAULT 'General Local',
    provenance TEXT NOT NULL DEFAULT 'FIRST_HAND_CITIZEN' CHECK (provenance IN (
        'FIRST_HAND_CITIZEN', 'COMMUNITY_OBSERVATION', 'OFFICIAL_NOTICE', 'FIELD_VERIFIED', 'BUSINESS_PROPRIETOR'
    )),
    source_name TEXT,
    source_url TEXT,
    verification_state TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_state IN (
        'UNVERIFIED', 'COMMUNITY_CORROBORATED', 'OFFICIALLY_VERIFIED', 'DISPUTED'
    )),
    trust_dossier JSONB NOT NULL DEFAULT '{}'::jsonb,
    confirmations_count INT NOT NULL DEFAULT 0,
    disputes_count INT NOT NULL DEFAULT 0,
    ratings_count INT NOT NULL DEFAULT 0,
    average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    comments_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN (
        'PUBLISHED', 'PENDING_MODERATION', 'FLAGGED', 'ARCHIVED'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. PERFORMANCE & RETRIEVAL INDEXES ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_community_contrib_locality ON public.community_contributions(locality);
CREATE INDEX IF NOT EXISTS idx_community_contrib_status ON public.community_contributions(status);
CREATE INDEX IF NOT EXISTS idx_community_contrib_created ON public.community_contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_contrib_author ON public.community_contributions(author_id);
CREATE INDEX IF NOT EXISTS idx_community_contrib_biz ON public.community_contributions(business_id);
CREATE INDEX IF NOT EXISTS idx_community_contrib_type ON public.community_contributions(type);

-- ── 3. ROW LEVEL SECURITY (RLS) POLICIES ───────────────────────────────────────
ALTER TABLE public.community_contributions ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC READ: Anyone (anon or authenticated) can view PUBLISHED contributions
DROP POLICY IF EXISTS "Public can view published community contributions" ON public.community_contributions;
CREATE POLICY "Public can view published community contributions"
    ON public.community_contributions FOR SELECT
    TO anon, authenticated
    USING (status = 'PUBLISHED');

-- 2. AUTHOR READ: Authors can view their own contributions (including PENDING_MODERATION or FLAGGED)
DROP POLICY IF EXISTS "Authors can view own community contributions" ON public.community_contributions;
CREATE POLICY "Authors can view own community contributions"
    ON public.community_contributions FOR SELECT
    TO anon, authenticated
    USING (
        (auth.uid() IS NOT NULL AND author_id = auth.uid()::text)
    );

-- 3. ADMIN READ: Admins can view all contributions for moderation
DROP POLICY IF EXISTS "Admins can view all community contributions" ON public.community_contributions;
CREATE POLICY "Admins can view all community contributions"
    ON public.community_contributions FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 4. INSERT: Authorized users can create contributions with strict input validation
DROP POLICY IF EXISTS "Users can insert community contributions" ON public.community_contributions;
CREATE POLICY "Users can insert community contributions"
    ON public.community_contributions FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        title IS NOT NULL AND length(trim(title)) >= 3 AND
        content IS NOT NULL AND length(trim(content)) >= 10 AND
        locality IS NOT NULL AND length(trim(locality)) >= 2
    );

-- 5. UPDATE: Author or Admin can update records
DROP POLICY IF EXISTS "Authors or Admins can update community contributions" ON public.community_contributions;
CREATE POLICY "Authors or Admins can update community contributions"
    ON public.community_contributions FOR UPDATE
    TO authenticated
    USING (
        (auth.uid() IS NOT NULL AND author_id = auth.uid()::text) OR
        public.is_admin()
    )
    WITH CHECK (
        (auth.uid() IS NOT NULL AND author_id = auth.uid()::text) OR
        public.is_admin()
    );

-- 6. DELETE: Only Admins can permanently remove or block contributions
DROP POLICY IF EXISTS "Admins can delete community contributions" ON public.community_contributions;
CREATE POLICY "Admins can delete community contributions"
    ON public.community_contributions FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ── 4. SECURITY DEFINER HELPER: SAFE COMMUNITY CONFIRMATION ───────────────────
-- Allows neighbor corroboration without opening wide UPDATE permissions
CREATE OR REPLACE FUNCTION public.confirm_community_contribution(
    contribution_id TEXT,
    confirming_user_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    target_contrib RECORD;
    new_confirmations INT;
    new_state TEXT;
BEGIN
    SELECT * INTO target_contrib 
    FROM public.community_contributions 
    WHERE id = contribution_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contribution not found';
    END IF;

    -- Anti-gaming invariant: Authors cannot confirm their own contribution
    IF target_contrib.author_id = confirming_user_id THEN
        RAISE EXCEPTION 'Authors cannot confirm their own contribution';
    END IF;

    new_confirmations := target_contrib.confirmations_count + 1;
    new_state := CASE 
        WHEN new_confirmations >= 3 AND target_contrib.verification_state = 'UNVERIFIED' THEN 'COMMUNITY_CORROBORATED'
        ELSE target_contrib.verification_state
    END;

    UPDATE public.community_contributions
    SET 
        confirmations_count = new_confirmations,
        verification_state = new_state,
        last_checked_at = NOW(),
        updated_at = NOW()
    WHERE id = contribution_id;

    RETURN jsonb_build_object(
        'success', true,
        'id', contribution_id,
        'confirmations_count', new_confirmations,
        'verification_state', new_state
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
