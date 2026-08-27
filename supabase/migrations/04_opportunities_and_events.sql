-- ==============================================================================
-- MADE — SUPABASE DATABASE MIGRATION: OPPORTUNITIES & EVENTS
-- Phase 5: Opportunities, Events, Application Tracking, Saved Items & RSVPs
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE public.opportunity_type AS ENUM (
        'HACKATHON', 'INTERNSHIP', 'FELLOWSHIP', 'COMPETITION', 'SCHOLARSHIP', 'GRANT', 'PROGRAM', 'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.opportunity_status AS ENUM (
        'OPEN', 'CLOSING_SOON', 'CLOSED', 'ARCHIVED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.opportunity_app_status AS ENUM (
        'INTERESTED', 'APPLIED', 'COMPLETED', 'DISMISSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.event_type AS ENUM (
        'MEETUP', 'WORKSHOP', 'HACKATHON', 'DEMO_DAY', 'TALK', 'CONFERENCE', 'COMMUNITY', 'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.event_rsvp_status AS ENUM (
        'GOING', 'MAYBE', 'NOT_GOING'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Opportunities Table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    organization TEXT NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    type public.opportunity_type NOT NULL DEFAULT 'HACKATHON',
    location TEXT,
    is_remote BOOLEAN NOT NULL DEFAULT true,
    application_url TEXT,
    deadline TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status public.opportunity_status NOT NULL DEFAULT 'OPEN',
    cover_image TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opps_slug ON public.opportunities(slug);
CREATE INDEX IF NOT EXISTS idx_opps_type ON public.opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opps_deadline ON public.opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opps_published ON public.opportunities(is_published);

-- 3. Saved Opportunities Table (User Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_saved_opp UNIQUE (user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_opps_user ON public.saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_opps_opp ON public.saved_opportunities(opportunity_id);

-- 4. Opportunity Personal Application Tracker Table
CREATE TABLE IF NOT EXISTS public.opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    status public.opportunity_app_status NOT NULL DEFAULT 'INTERESTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_opp_app UNIQUE (user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_opp_apps_user ON public.opportunity_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_opp_apps_opp ON public.opportunity_applications(opportunity_id);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    organizer TEXT NOT NULL DEFAULT 'MADE',
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type public.event_type NOT NULL DEFAULT 'MEETUP',
    location TEXT,
    is_remote BOOLEAN NOT NULL DEFAULT true,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    registration_url TEXT,
    cover_image TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_start ON public.events(start_at);
CREATE INDEX IF NOT EXISTS idx_events_published ON public.events(is_published);

-- 6. Event RSVPs Table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    status public.event_rsvp_status NOT NULL DEFAULT 'GOING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_event_rsvp UNIQUE (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON public.event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON public.event_rsvps(event_id);

-- 7. Enable Row Level Security
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- 8. Helper function to check if current user is ADMIN or SUPER_ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    );
$$;

-- 9. Opportunities RLS Policies
DROP POLICY IF EXISTS "opps_select" ON public.opportunities;
CREATE POLICY "opps_select"
    ON public.opportunities
    FOR SELECT
    TO anon, authenticated
    USING (
        is_published = true OR public.is_admin()
    );

DROP POLICY IF EXISTS "opps_admin_modify" ON public.opportunities;
CREATE POLICY "opps_admin_modify"
    ON public.opportunities
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 10. Saved Opportunities RLS Policies
DROP POLICY IF EXISTS "saved_opps_select" ON public.saved_opportunities;
CREATE POLICY "saved_opps_select"
    ON public.saved_opportunities
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_opps_insert" ON public.saved_opportunities;
CREATE POLICY "saved_opps_insert"
    ON public.saved_opportunities
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_opps_delete" ON public.saved_opportunities;
CREATE POLICY "saved_opps_delete"
    ON public.saved_opportunities
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 11. Opportunity Applications (Personal Tracker) RLS Policies
DROP POLICY IF EXISTS "opp_apps_all" ON public.opportunity_applications;
CREATE POLICY "opp_apps_all"
    ON public.opportunity_applications
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 12. Events RLS Policies
DROP POLICY IF EXISTS "events_select" ON public.events;
CREATE POLICY "events_select"
    ON public.events
    FOR SELECT
    TO anon, authenticated
    USING (
        is_published = true OR public.is_admin()
    );

DROP POLICY IF EXISTS "events_admin_modify" ON public.events;
CREATE POLICY "events_admin_modify"
    ON public.events
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 13. Event RSVPs RLS Policies
DROP POLICY IF EXISTS "event_rsvps_all" ON public.event_rsvps;
CREATE POLICY "event_rsvps_all"
    ON public.event_rsvps
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
