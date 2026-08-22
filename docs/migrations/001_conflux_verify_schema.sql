-- ==============================================================================
-- CONFLUX VERIFY — PRODUCTION DATABASE SCHEMA (MIGRATION 001)
-- Framework: Supabase / PostgreSQL 15+
-- Design: Provenance-Preserving, Claim-Type-Aware Verification Architecture
-- ==============================================================================

-- 1. Entities Table (Supports Disambiguation & Alias Mapping)
CREATE TABLE IF NOT EXISTS public.verify_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    legal_name TEXT,
    normalized_name TEXT NOT NULL,
    entity_type TEXT NOT NULL DEFAULT 'BUSINESS' CHECK (entity_type IN ('BUSINESS', 'INSTITUTION', 'BRAND', 'INDIVIDUAL')),
    country TEXT DEFAULT 'India',
    state TEXT,
    jurisdiction TEXT DEFAULT 'India',
    official_url TEXT,
    registration_identifier TEXT, -- CIN / GSTIN / LLPIN / MSME / Reg Number
    canonical_entity_id UUID REFERENCES public.verify_entities(id), -- Alias mapping
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_canonical_entity_not_self CHECK (canonical_entity_id IS NULL OR canonical_entity_id <> id)
);

CREATE INDEX IF NOT EXISTS idx_verify_entities_slug ON public.verify_entities(slug);
CREATE INDEX IF NOT EXISTS idx_verify_entities_norm_name ON public.verify_entities(normalized_name);
CREATE INDEX IF NOT EXISTS idx_verify_entities_reg_id ON public.verify_entities(registration_identifier);
CREATE INDEX IF NOT EXISTS idx_verify_entities_canonical ON public.verify_entities(canonical_entity_id);

-- 2. Claims Table (Scoped Deduplication)
CREATE TABLE IF NOT EXISTS public.verify_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES public.verify_entities(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    claim_normalized TEXT NOT NULL,
    claim_hash TEXT NOT NULL UNIQUE, -- Deterministic SHA-256 (norm_entity || '::' || norm_claim)
    claim_type TEXT NOT NULL DEFAULT 'GENERAL_FACT' CHECK (claim_type IN (
        'LEGAL_EXISTENCE',
        'REGISTRATION',
        'CERTIFICATION',
        'AUTHORIZATION_PARTNERSHIP',
        'MANUFACTURING_CAPABILITY',
        'PRODUCT_SPECIFICATION',
        'HISTORICAL_RECORD',
        'LEADERSHIP_GOVERNANCE',
        'FINANCIAL_METRIC',
        'GENERAL_FACT'
    )),
    claim_category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_entity_claim UNIQUE (entity_id, claim_normalized)
);

CREATE INDEX IF NOT EXISTS idx_verify_claims_hash ON public.verify_claims(claim_hash);
CREATE INDEX IF NOT EXISTS idx_verify_claims_entity ON public.verify_claims(entity_id);
CREATE INDEX IF NOT EXISTS idx_verify_claims_type ON public.verify_claims(claim_type);

-- 3. Sources Table (Cross-Claim Deduplication & Copycat Tracking)
CREATE TABLE IF NOT EXISTS public.verify_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_url TEXT NOT NULL UNIQUE, -- Enforces cross-claim source deduplication
    domain TEXT NOT NULL,
    title TEXT,
    publisher TEXT,
    source_tier TEXT NOT NULL CHECK (source_tier IN (
        'TIER_1_PRIMARY_AUTHORITATIVE',      -- Statutory registries, court records, gazettes, accredited registrars
        'TIER_2_FIRST_PARTY',                 -- Company website, annual filings, direct executive disclosures
        'TIER_3_INDEPENDENT_HIGH_QUALITY',   -- Investigative journalism, peer-reviewed journals, trade watchdogs
        'TIER_4_SECONDARY',                  -- Aggregators, trade directories, company blogs, press release syndications
        'TIER_5_USER_GENERATED'              -- Forums, Reddit, community comments, unverified user submissions
    )),
    is_primary_registrar BOOLEAN DEFAULT FALSE,
    parent_source_id UUID REFERENCES public.verify_sources(id), -- Origin for press releases / syndicated copy
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    publication_date TIMESTAMPTZ,
    CONSTRAINT chk_parent_source_not_self CHECK (parent_source_id IS NULL OR parent_source_id <> id)
);

CREATE INDEX IF NOT EXISTS idx_verify_sources_domain ON public.verify_sources(domain);
CREATE INDEX IF NOT EXISTS idx_verify_sources_tier ON public.verify_sources(source_tier);
CREATE INDEX IF NOT EXISTS idx_verify_sources_parent ON public.verify_sources(parent_source_id);

-- 4. Evidence Records Table (Temporal Versioning & Provenance)
CREATE TABLE IF NOT EXISTS public.verify_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.verify_claims(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES public.verify_sources(id) ON DELETE CASCADE,
    stance TEXT NOT NULL CHECK (stance IN ('SUPPORTS', 'CONTRADICTS', 'NEUTRAL', 'MENTIONS')),
    strength TEXT NOT NULL CHECK (strength IN ('HIGH', 'MEDIUM', 'LOW')),
    excerpt TEXT NOT NULL,
    syndication_type TEXT NOT NULL DEFAULT 'ORIGINAL' CHECK (syndication_type IN (
        'ORIGINAL',
        'SYNDICATED',
        'PARAPHRASED',
        'INDEPENDENT_CORROBORATION'
    )),
    is_primary_origin BOOLEAN NOT NULL DEFAULT TRUE,
    derived_from_evidence_id UUID REFERENCES public.verify_evidence(id), -- Provenance / copycat relationship
    superseded_by UUID REFERENCES public.verify_evidence(id),          -- Temporal replacement relationship
    is_active BOOLEAN NOT NULL DEFAULT TRUE, -- Temporal versioning: remains FALSE if superseded
    valid_until TIMESTAMPTZ, -- Expiration for time-bounded certifications / authorizations
    publication_date TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_derived_evidence_not_self CHECK (derived_from_evidence_id IS NULL OR derived_from_evidence_id <> id),
    CONSTRAINT chk_superseded_evidence_not_self CHECK (superseded_by IS NULL OR superseded_by <> id)
);

CREATE INDEX IF NOT EXISTS idx_verify_evidence_claim ON public.verify_evidence(claim_id);
CREATE INDEX IF NOT EXISTS idx_verify_evidence_stance ON public.verify_evidence(stance);
CREATE INDEX IF NOT EXISTS idx_verify_evidence_active ON public.verify_evidence(is_active);
CREATE INDEX IF NOT EXISTS idx_verify_evidence_derived ON public.verify_evidence(derived_from_evidence_id);
CREATE INDEX IF NOT EXISTS idx_verify_evidence_superseded ON public.verify_evidence(superseded_by);

-- 5. Verification Results Table (Authoritative Current Canonical State)
CREATE TABLE IF NOT EXISTS public.verify_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES public.verify_entities(id) ON DELETE CASCADE,
    claim_id UUID NOT NULL REFERENCES public.verify_claims(id) ON DELETE CASCADE UNIQUE, -- Exactly 1 current result per claim
    status TEXT NOT NULL CHECK (status IN (
        'SUPPORTED',
        'PARTIALLY_SUPPORTED',
        'CONTRADICTED',
        'UNVERIFIED',
        'INSUFFICIENT_EVIDENCE',
        'OUTDATED',
        'DISPUTED'
    )),
    confidence NUMERIC(5, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    explanation TEXT NOT NULL,
    limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
    version INT NOT NULL DEFAULT 1, -- Incremented on re-verification
    is_indexable BOOLEAN NOT NULL DEFAULT FALSE, -- Gated strictly by evidence depth + editorial review
    is_editorially_approved BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verify_results_status ON public.verify_results(status);
CREATE INDEX IF NOT EXISTS idx_verify_results_indexable ON public.verify_results(is_indexable) WHERE is_indexable = TRUE;

-- 6. Verification History Table (Full Audit Trail & Snapshots)
CREATE TABLE IF NOT EXISTS public.verify_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID NOT NULL REFERENCES public.verify_results(id) ON DELETE CASCADE,
    claim_id UUID NOT NULL REFERENCES public.verify_claims(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    previous_confidence NUMERIC(5, 2),
    new_confidence NUMERIC(5, 2) NOT NULL,
    evidence_count INT NOT NULL DEFAULT 0,
    evidence_ids_snapshot UUID[] DEFAULT '{}', -- Exact immutable evidence record IDs supporting this snapshot
    reason_for_change TEXT NOT NULL,
    changed_by TEXT NOT NULL DEFAULT 'SYSTEM_RECHECK',
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verify_history_claim ON public.verify_history(claim_id);
CREATE INDEX IF NOT EXISTS idx_verify_history_changed_at ON public.verify_history(changed_at);

-- 7. Verification Telemetry (Zero PII, Operational Metrics Only)
CREATE TABLE IF NOT EXISTS public.verify_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    claim_hash TEXT, -- Pseudonymous identifier
    claim_type TEXT,
    duration_ms INT,
    source_count INT,
    has_contradictions BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verify_analytics_event ON public.verify_analytics(event_name);
CREATE INDEX IF NOT EXISTS idx_verify_analytics_created ON public.verify_analytics(created_at);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — STRICT ACCESS CONTROL
-- ==============================================================================

-- 1. Enable RLS unconditionally on all 7 tables
ALTER TABLE public.verify_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verify_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verify_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verify_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verify_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verify_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verify_analytics ENABLE ROW LEVEL SECURITY;

-- 2. PUBLIC / ANONYMOUS ROLE (SELECT ONLY — ZERO MUTATION PRIVILEGES)
-- Public users can inspect verified entities, claims, sources, active evidence, results, and history
CREATE POLICY "Public Read: Entities" ON public.verify_entities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read: Claims" ON public.verify_claims FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read: Sources" ON public.verify_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read: Active Evidence" ON public.verify_evidence FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public Read: Verification Results" ON public.verify_results FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read: Verification History" ON public.verify_history FOR SELECT TO anon, authenticated USING (true);

-- Explicitly Deny Public Mutations on Verification State (Safety Defense-in-Depth)
-- Note: In Supabase, by enabling RLS without creating INSERT/UPDATE/DELETE policies for 'anon',
-- all public write operations are automatically denied with HTTP 403 / RLS violation.

-- 3. SERVICE ROLE POLICIES (Full Administrative Write & Execution Rights)
-- All pipeline mutations occur exclusively on serverless functions via SUPABASE_SERVICE_KEY
CREATE POLICY "Service Role: Full Access Entities" ON public.verify_entities FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Claims" ON public.verify_claims FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Sources" ON public.verify_sources FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Evidence" ON public.verify_evidence FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Results" ON public.verify_results FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access History" ON public.verify_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Analytics" ON public.verify_analytics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==============================================================================
-- ROLLBACK SCRIPT (FOR REFERENCE / REVERSION)
-- ==============================================================================
/*
DROP TABLE IF EXISTS public.verify_analytics CASCADE;
DROP TABLE IF EXISTS public.verify_history CASCADE;
DROP TABLE IF EXISTS public.verify_results CASCADE;
DROP TABLE IF EXISTS public.verify_evidence CASCADE;
DROP TABLE IF EXISTS public.verify_sources CASCADE;
DROP TABLE IF EXISTS public.verify_claims CASCADE;
DROP TABLE IF EXISTS public.verify_entities CASCADE;
*/
