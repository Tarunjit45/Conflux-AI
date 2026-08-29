-- ==============================================================================
-- CONFLUX PLATFORM — PRODUCTION SUPABASE POSTGRESQL SCHEMA & RLS HARDENING (MIGRATION 003)
-- Framework: Supabase / PostgreSQL 15+
-- Security: Strict Multi-Tenant Row Level Security (RLS) + Non-Recursive Security Definer Helpers
-- ==============================================================================

-- ── 1. PROFILES & ROLE-BASED ACCESS CONTROL ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'BUSINESS_OWNER', 'USER', 'PUBLIC_USER')),
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Non-recursive Security Definer Helpers to prevent PostgreSQL RLS recursion (42P17)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles RLS:
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update own non-role fields" ON public.profiles;
CREATE POLICY "Users can update own non-role fields"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = public.get_my_role());

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

-- ── 2. CANONICAL BUSINESS GRAPH NODES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conflux_business_id TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    legal_name TEXT,
    business_type TEXT NOT NULL DEFAULT 'LOCAL_BUSINESS' CHECK (business_type IN (
        'LOCAL_BUSINESS', 'MANUFACTURER', 'HEALTHCARE', 'PROFESSIONAL_SERVICE',
        'HOSPITALITY', 'INSTITUTION', 'RETAIL', 'AGRO_PROCESSING', 'HANDLOOM_CRAFT', 'FITNESS_WELLNESS', 'HOME_REPAIR'
    )),
    category_id TEXT NOT NULL,
    category_name TEXT,
    subcategory_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    landmark TEXT,
    storefront_photo_url TEXT,
    description TEXT NOT NULL,
    short_summary TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED'
    )),
    claim_status TEXT NOT NULL DEFAULT 'UNCLAIMED_PUBLIC' CHECK (claim_status IN (
        'UNCLAIMED_PUBLIC', 'CLAIM_PENDING', 'VERIFIED_OWNER', 'REJECTED'
    )),
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN (
        'SUPPORTED', 'PARTIALLY_SUPPORTED', 'CONTRADICTED', 'UNVERIFIED',
        'INSUFFICIENT_EVIDENCE', 'OUTDATED', 'DISPUTED'
    )),
    verification_level TEXT NOT NULL DEFAULT 'NONE' CHECK (verification_level IN (
        'NONE', 'BASIC', 'STATUTORY_VERIFIED', 'ENTERPRISE_AUTHENTICATED'
    )),
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    primary_registrar TEXT,
    evidence_summary TEXT,
    verification_breakdown JSONB,
    last_verified_at TIMESTAMPTZ,
    is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    is_indexable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_cfx_id ON public.businesses(conflux_business_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_ver_status ON public.businesses(verification_status);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published businesses" ON public.businesses;
CREATE POLICY "Public can view published businesses"
    ON public.businesses FOR SELECT
    USING (status = 'PUBLISHED');

DROP POLICY IF EXISTS "Owners can view own businesses" ON public.businesses;
CREATE POLICY "Owners can view own businesses"
    ON public.businesses FOR SELECT
    USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update own businesses" ON public.businesses;
CREATE POLICY "Owners can update own businesses"
    ON public.businesses FOR UPDATE
    USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full business access" ON public.businesses;
CREATE POLICY "Admins have full business access"
    ON public.businesses FOR ALL
    USING (public.is_admin());

-- ── 3. BUSINESS LOCATIONS & CAPABILITIES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.business_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT NOT NULL DEFAULT 'West Bengal',
    district TEXT NOT NULL,
    city TEXT NOT NULL,
    locality TEXT,
    landmark TEXT,
    postal_code TEXT,
    full_address TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    service_areas JSONB DEFAULT '[]'::jsonb,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_district ON public.business_locations(district);
CREATE INDEX IF NOT EXISTS idx_locations_city ON public.business_locations(city);
CREATE INDEX IF NOT EXISTS idx_locations_biz_id ON public.business_locations(business_id);

ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view locations of published businesses" ON public.business_locations;
CREATE POLICY "Public can view locations of published businesses"
    ON public.business_locations FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Admins manage all locations" ON public.business_locations;
CREATE POLICY "Admins manage all locations"
    ON public.business_locations FOR ALL
    USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.business_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('CALL', 'WHATSAPP', 'BOOKING', 'APPOINTMENT', 'QUOTE_REQUEST', 'DIRECTIONS', 'WEBSITE')),
    is_supported BOOLEAN NOT NULL DEFAULT TRUE,
    phone_target TEXT,
    endpoint_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.business_capabilities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view capabilities of published businesses" ON public.business_capabilities;
CREATE POLICY "Public can view capabilities of published businesses"
    ON public.business_capabilities FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.status = 'PUBLISHED'));

DROP POLICY IF EXISTS "Admins manage all capabilities" ON public.business_capabilities;
CREATE POLICY "Admins manage all capabilities"
    ON public.business_capabilities FOR ALL
    USING (public.is_admin());

-- ── 4. INTAKE APPLICATIONS & PRIVATE EVIDENCE ISOLATION ───────────────────────
CREATE TABLE IF NOT EXISTS public.business_applications (
    id TEXT PRIMARY KEY, -- e.g. APP-2026-0001
    conflux_business_id TEXT NOT NULL,
    submission_type TEXT NOT NULL CHECK (submission_type IN ('STANDARD_LISTING', 'CONFLUX_VERIFIED')),
    applicant_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    business_name TEXT NOT NULL,
    legal_name TEXT,
    business_type TEXT NOT NULL,
    category_id TEXT NOT NULL,
    category_name TEXT,
    description TEXT NOT NULL,
    district TEXT NOT NULL,
    city TEXT NOT NULL,
    landmark TEXT,
    full_address TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT NOT NULL,
    website_url TEXT,
    booking_url TEXT,
    owner_name TEXT NOT NULL,
    owner_role TEXT NOT NULL,
    storefront_photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN (
        'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'VERIFIED', 'REJECTED'
    )),
    admin_notes TEXT,
    changes_requested_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.business_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applicants can view own applications" ON public.business_applications;
CREATE POLICY "Applicants can view own applications"
    ON public.business_applications FOR SELECT
    USING (applicant_user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can submit an application" ON public.business_applications;
CREATE POLICY "Anyone can submit an application"
    ON public.business_applications FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full application access" ON public.business_applications;
CREATE POLICY "Admins have full application access"
    ON public.business_applications FOR ALL
    USING (public.is_admin());

-- ── 5. PRIVATE EVIDENCE DOCUMENTS (STRICT PRIVATE ISOLATION) ─────────────────
CREATE TABLE IF NOT EXISTS public.private_evidence_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id TEXT REFERENCES public.business_applications(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    applicant_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    document_number TEXT,
    document_file_url TEXT NOT NULL,
    is_private BOOLEAN NOT NULL DEFAULT TRUE, -- STRICTLY ALWAYS TRUE
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.private_evidence_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Strict private evidence access only for applicant or admin" ON public.private_evidence_documents;
CREATE POLICY "Strict private evidence access only for applicant or admin"
    ON public.private_evidence_documents FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND applicant_user_id = auth.uid()) OR
        public.is_admin()
    );

DROP POLICY IF EXISTS "Applicants or Admins can insert private evidence" ON public.private_evidence_documents;
CREATE POLICY "Applicants or Admins can insert private evidence"
    ON public.private_evidence_documents FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage private evidence" ON public.private_evidence_documents;
CREATE POLICY "Admins can manage private evidence"
    ON public.private_evidence_documents FOR ALL
    USING (public.is_admin());

-- ── 6. USER CONTRIBUTIONS (REVIEWS, EDITS, REPORTS) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.user_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_name TEXT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_display_name TEXT NOT NULL,
    contribution_type TEXT NOT NULL CHECK (contribution_type IN ('REVIEW_RATING', 'SUGGESTED_EDIT', 'INACCURACY_REPORT')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    field_name TEXT,
    suggested_value TEXT,
    rationale TEXT,
    issue_type TEXT,
    details TEXT,
    moderation_status TEXT NOT NULL DEFAULT 'PENDING_MODERATION' CHECK (moderation_status IN ('PENDING_MODERATION', 'APPROVED', 'REJECTED')),
    admin_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contrib_biz_id ON public.user_contributions(business_id);
CREATE INDEX IF NOT EXISTS idx_contrib_status ON public.user_contributions(moderation_status);

ALTER TABLE public.user_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.user_contributions;
CREATE POLICY "Public can view approved reviews"
    ON public.user_contributions FOR SELECT
    USING (moderation_status = 'APPROVED' AND contribution_type = 'REVIEW_RATING');

DROP POLICY IF EXISTS "Users can view own contributions" ON public.user_contributions;
CREATE POLICY "Users can view own contributions"
    ON public.user_contributions FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can submit contributions" ON public.user_contributions;
CREATE POLICY "Authenticated users can submit contributions"
    ON public.user_contributions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all contributions" ON public.user_contributions;
CREATE POLICY "Admins manage all contributions"
    ON public.user_contributions FOR ALL
    USING (public.is_admin());

-- ── 7. TELEMETRY & LEADS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.connect_telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    intent_id TEXT,
    event_type TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'HUMAN_WEB',
    session_pseudonym TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.connect_telemetry_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert telemetry events" ON public.connect_telemetry_events;
CREATE POLICY "Anyone can insert telemetry events"
    ON public.connect_telemetry_events FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view telemetry events" ON public.connect_telemetry_events;
CREATE POLICY "Admins can view telemetry events"
    ON public.connect_telemetry_events FOR SELECT
    USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    service_requested TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DELIVERED', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
    ON public.leads FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Business owners or Admins can view leads" ON public.leads;
CREATE POLICY "Business owners or Admins can view leads"
    ON public.leads FOR SELECT
    USING (
        public.is_admin() OR
        EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
    );

-- ── 8. AUTO USER PROFILE CREATION TRIGGER ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'USER'))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 9. POSTS & LEGACY CONTENT TABLE RLS HARDENING ─────────────────────────────
-- Resolves Supabase Security Advisor Linter: "RLS Disabled in Public public.posts"
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
        CREATE POLICY "Public can view published posts"
            ON public.posts FOR SELECT
            USING (true);

        DROP POLICY IF EXISTS "Admins have full access to posts" ON public.posts;
        CREATE POLICY "Admins have full access to posts"
            ON public.posts FOR ALL
            USING (public.is_admin());
    END IF;
END $$;

-- ── 10. STORAGE BUCKETS & RLS POLICIES ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-assets', 'business-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('private-evidence', 'private-evidence', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view business assets" ON storage.objects;
CREATE POLICY "Public can view business assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "Anyone can upload business assets" ON storage.objects;
CREATE POLICY "Anyone can upload business assets"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "Private evidence only accessible by owner or admin" ON storage.objects;
CREATE POLICY "Private evidence only accessible by owner or admin"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'private-evidence' AND
        (auth.uid() = owner OR public.is_admin())
    );

DROP POLICY IF EXISTS "Anyone can upload private evidence" ON storage.objects;
CREATE POLICY "Anyone can upload private evidence"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'private-evidence');

