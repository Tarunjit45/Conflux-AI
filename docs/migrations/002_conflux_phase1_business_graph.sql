-- ==============================================================================
-- CONFLUX PLATFORM — PHASE 1 BUSINESS GRAPH DATABASE SCHEMA (MIGRATION 002)
-- Framework: Supabase / PostgreSQL 15+
-- Design: Agent-Native Business Graph, Provenance-Preserving Trust & Connect Layer
-- ==============================================================================

-- 1. User Profiles & Multi-Tenant RBAC
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'PUBLIC_USER' CHECK (role IN ('ADMIN', 'BUSINESS_OWNER', 'PUBLIC_USER')),
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Conflux Business Entities (Canonical Identity Node)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conflux_business_id TEXT NOT NULL UNIQUE, -- e.g. CFX-IN-WB-NADIA-000001
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    legal_name TEXT,
    business_type TEXT NOT NULL DEFAULT 'LOCAL_BUSINESS' CHECK (business_type IN (
        'LOCAL_BUSINESS', 'MANUFACTURER', 'HEALTHCARE', 'PROFESSIONAL_SERVICE',
        'HOSPITALITY', 'INSTITUTION', 'RETAIL', 'AGRO_PROCESSING', 'HANDLOOM_CRAFT'
    )),
    category_id TEXT NOT NULL,
    subcategory_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT NOT NULL,
    short_summary TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_VERIFICATION', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED'
    )),
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN (
        'SUPPORTED', 'PARTIALLY_SUPPORTED', 'CONTRADICTED', 'UNVERIFIED',
        'INSUFFICIENT_EVIDENCE', 'OUTDATED', 'DISPUTED'
    )),
    verification_level TEXT NOT NULL DEFAULT 'NONE' CHECK (verification_level IN (
        'NONE', 'BASIC', 'STATUTORY_VERIFIED', 'ENTERPRISE_AUTHENTICATED'
    )),
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    is_indexable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_cfx_id ON public.businesses(conflux_business_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_ver_status ON public.businesses(verification_status);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);

-- 3. Business Locations & Coordinates
CREATE TABLE IF NOT EXISTS public.business_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT NOT NULL DEFAULT 'West Bengal',
    district TEXT NOT NULL, -- e.g. 'nadia'
    city TEXT NOT NULL,     -- e.g. 'ranaghat'
    locality TEXT,
    postal_code TEXT,
    full_address TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    service_areas JSONB DEFAULT '[]'::jsonb,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biz_locations_biz ON public.business_locations(business_id);
CREATE INDEX IF NOT EXISTS idx_biz_locations_dist_city ON public.business_locations(district, city);

-- 4. Business Connectivity & Contact Channels
CREATE TABLE IF NOT EXISTS public.business_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website_url TEXT,
    booking_url TEXT,
    appointment_url TEXT,
    google_maps_url TEXT,
    social_profiles JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biz_contacts_biz ON public.business_contacts(business_id);

-- 5. Business Operating Hours & Availability
CREATE TABLE IF NOT EXISTS public.business_operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    opens_at TIME,
    closes_at TIME,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    temporary_closure_reason TEXT,
    temporary_closure_valid_until TIMESTAMPTZ,
    CONSTRAINT uq_biz_day UNIQUE (business_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_biz_hours_biz ON public.business_operating_hours(business_id);

-- 6. Business Capabilities & Machine Action Endpoints (Agent Execution)
CREATE TABLE IF NOT EXISTS public.business_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'CALL', 'WHATSAPP', 'WEBSITE', 'DIRECTIONS', 'BOOKING', 'APPOINTMENT', 'QUOTE_REQUEST', 'ORDER'
    )),
    is_supported BOOLEAN NOT NULL DEFAULT TRUE,
    endpoint_url TEXT,
    phone_target TEXT,
    availability_schedule JSONB DEFAULT '{}'::jsonb,
    machine_schema JSONB DEFAULT '{}'::jsonb,
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN (
        'VERIFIED', 'UNVERIFIED', 'DEPRECATED'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_biz_action UNIQUE (business_id, action_type)
);

CREATE INDEX IF NOT EXISTS idx_biz_caps_biz ON public.business_capabilities(business_id);
CREATE INDEX IF NOT EXISTS idx_biz_caps_action ON public.business_capabilities(action_type);

-- 7. Discovery Intents & Query Observations
CREATE TABLE IF NOT EXISTS public.discovery_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_query TEXT NOT NULL,
    normalized_intent TEXT NOT NULL UNIQUE,
    category_id TEXT,
    location_slug TEXT,
    structured_constraints JSONB NOT NULL DEFAULT '{}'::jsonb,
    observed_count INT NOT NULL DEFAULT 1,
    first_observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disc_intents_norm ON public.discovery_intents(normalized_intent);
CREATE INDEX IF NOT EXISTS idx_disc_intents_cat_loc ON public.discovery_intents(category_id, location_slug);

-- 8. Explainable Discovery Signals (Per Business)
CREATE TABLE IF NOT EXISTS public.discovery_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
    profile_completeness_ratio NUMERIC(4, 3) NOT NULL DEFAULT 0.000,
    tier1_evidence_count INT NOT NULL DEFAULT 0,
    tier2_evidence_count INT NOT NULL DEFAULT 0,
    overall_verification_confidence NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    last_verified_days_ago INT NOT NULL DEFAULT 0,
    connect_actions_30d INT NOT NULL DEFAULT 0,
    response_latency_seconds_avg NUMERIC(6, 2),
    organic_impressions_30d INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disc_signals_biz ON public.discovery_signals(business_id);

-- 9. Connect Telemetry & Interaction Stream
CREATE TABLE IF NOT EXISTS public.connect_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    intent_id UUID REFERENCES public.discovery_intents(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'BUSINESS_VIEW', 'PHONE_CLICK', 'WHATSAPP_CLICK', 'WEBSITE_CLICK',
        'DIRECTIONS_CLICK', 'BOOKING_CLICK', 'LEAD_SUBMITTED', 'AGENT_API_QUERY'
    )),
    channel TEXT NOT NULL DEFAULT 'HUMAN_WEB' CHECK (channel IN (
        'HUMAN_WEB', 'AI_AGENT_REST_API', 'AI_AGENT_MCP'
    )),
    session_pseudonym TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connect_events_biz ON public.connect_events(business_id);
CREATE INDEX IF NOT EXISTS idx_connect_events_type ON public.connect_events(event_type);
CREATE INDEX IF NOT EXISTS idx_connect_events_created ON public.connect_events(created_at);

-- 10. Platform Audit Logs
CREATE TABLE IF NOT EXISTS public.platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_state JSONB,
    new_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.platform_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.platform_audit_logs(created_at);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connect_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC READ (ANON & AUTHENTICATED)
CREATE POLICY "Public Read: Published Businesses" ON public.businesses
    FOR SELECT TO anon, authenticated USING (status = 'PUBLISHED');

CREATE POLICY "Public Read: Published Locations" ON public.business_locations
    FOR SELECT TO anon, authenticated USING (
        EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.status = 'PUBLISHED')
    );

CREATE POLICY "Public Read: Published Contacts" ON public.business_contacts
    FOR SELECT TO anon, authenticated USING (
        EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.status = 'PUBLISHED')
    );

CREATE POLICY "Public Read: Operating Hours" ON public.business_operating_hours
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public Read: Capabilities" ON public.business_capabilities
    FOR SELECT TO anon, authenticated USING (is_supported = true);

CREATE POLICY "Public Read: Discovery Signals" ON public.discovery_signals
    FOR SELECT TO anon, authenticated USING (true);

-- 2. PUBLIC WRITE: Connect Events
CREATE POLICY "Public Insert: Connect Events" ON public.connect_events
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 3. BUSINESS OWNER ACCESS
CREATE POLICY "Owner Read: Own Profile" ON public.profiles
    FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Owner Update: Own Profile" ON public.profiles
    FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Owner Read: Own Businesses" ON public.businesses
    FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Owner Update: Own Businesses" ON public.businesses
    FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- 4. SERVICE ROLE (FULL ADMINISTRATIVE RIGHTS)
CREATE POLICY "Service Role: Full Access Profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Businesses" ON public.businesses FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Locations" ON public.business_locations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Contacts" ON public.business_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Hours" ON public.business_operating_hours FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Capabilities" ON public.business_capabilities FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Intents" ON public.discovery_intents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Signals" ON public.discovery_signals FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Events" ON public.connect_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role: Full Access Audit" ON public.platform_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
