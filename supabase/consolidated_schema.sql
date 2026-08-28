-- ==============================================================================
-- MADE — CONSOLIDATED MASTER DATABASE SCHEMA & SECURITY POLICIES
-- Includes:
-- Phase 2: Profiles, User Roles, Triggers & Profile RLS
-- Phase 3: Extended Profiles, Skills, Interests & Avatars Storage
-- Phase 4: Projects, Tech Stack, Members, Build Logs & Covers Storage
-- Phase 5: Opportunities, Events, Application Tracking & RSVPs
-- Phase 6: Career Roles, Applications, Internal Notes & Resumes Storage
-- Phase 7: Super Admin Audit Logs & Platform Governance Policies
-- ==============================================================================

-- ==============================================================================
-- 1. ENUMS DEFINITIONS
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('MEMBER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.project_status AS ENUM ('IDEA', 'BUILDING', 'PROTOTYPE', 'LIVE', 'OPEN_SOURCE', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.project_member_role AS ENUM ('OWNER', 'COLLABORATOR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.opportunity_type AS ENUM (
        'HACKATHON', 'INTERNSHIP', 'FELLOWSHIP', 'COMPETITION', 'SCHOLARSHIP', 'GRANT', 'PROGRAM', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.opportunity_status AS ENUM (
        'OPEN', 'CLOSING_SOON', 'CLOSED', 'ARCHIVED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.opportunity_app_status AS ENUM (
        'INTERESTED', 'APPLIED', 'COMPLETED', 'DISMISSED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.event_type AS ENUM (
        'MEETUP', 'WORKSHOP', 'HACKATHON', 'DEMO_DAY', 'TALK', 'CONFERENCE', 'COMMUNITY', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.event_rsvp_status AS ENUM (
        'GOING', 'MAYBE', 'NOT_GOING'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.role_department AS ENUM (
        'ENGINEERING', 'AI_ML', 'DESIGN', 'CYBERSECURITY', 'CONTENT', 'COMMUNITY', 'OPERATIONS', 'RESEARCH', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.career_role_status AS ENUM (
        'OPEN', 'PAUSED', 'CLOSED', 'ARCHIVED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.application_status AS ENUM (
        'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 2. PUBLIC PROFILES & AUTOMATIC USER TRIGGERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    primary_focus TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    location TEXT,
    current_build TEXT,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    role public.user_role NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_focus ON public.profiles(primary_focus);

-- Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    derived_name TEXT;
    derived_username TEXT;
BEGIN
    derived_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    derived_username := LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g')) || '_' || SUBSTRING(NEW.id::text, 1, 4);

    INSERT INTO public.profiles (id, full_name, username, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        derived_name,
        derived_username,
        NEW.email,
        'MEMBER',
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = now();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Role Protection Trigger (Prevents Client Escalation)
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF auth.role() != 'service_role' AND NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        ) THEN
            RAISE EXCEPTION 'Unauthorized: Role modification is restricted to SUPER_ADMIN.';
        END IF;
    END IF;
    
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_roles ON public.profiles;
CREATE TRIGGER trg_protect_profile_roles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_roles();

-- Admin Helper Function
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

-- Super Admin Helper Function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    );
$$;

-- ==============================================================================
-- 3. RELATIONAL SKILLS & INTERESTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profile_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_profile_skill UNIQUE (profile_id, skill)
);

CREATE INDEX IF NOT EXISTS idx_profile_skills_profile ON public.profile_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_skill ON public.profile_skills(skill);

CREATE TABLE IF NOT EXISTS public.profile_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interest TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_profile_interest UNIQUE (profile_id, interest)
);

CREATE INDEX IF NOT EXISTS idx_profile_interests_profile ON public.profile_interests(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_interests_interest ON public.profile_interests(interest);

-- ==============================================================================
-- 4. PROJECTS, TECH STACK, MEMBERS & BUILD LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Engineering',
    status public.project_status NOT NULL DEFAULT 'BUILDING',
    cover_image TEXT,
    github_url TEXT,
    live_url TEXT,
    demo_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_public ON public.projects(is_public);

CREATE TABLE IF NOT EXISTS public.project_technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    technology TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_project_tech UNIQUE (project_id, technology)
);

CREATE INDEX IF NOT EXISTS idx_project_tech_project ON public.project_technologies(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tech_tech ON public.project_technologies(technology);

CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.project_member_role NOT NULL DEFAULT 'COLLABORATOR',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_project_member UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);

CREATE TABLE IF NOT EXISTS public.project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_updates_project ON public.project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_created ON public.project_updates(created_at DESC);

CREATE TABLE IF NOT EXISTS public.project_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.invitation_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_project_invitations_project ON public.project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_invitee ON public.project_invitations(invitee_id);

-- Automatic Owner Membership Trigger
CREATE OR REPLACE FUNCTION public.handle_project_owner_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.project_members (project_id, user_id, role, joined_at)
    VALUES (NEW.id, NEW.owner_id, 'OWNER', now())
    ON CONFLICT (project_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_project_created_owner ON public.projects;
CREATE TRIGGER on_project_created_owner
    AFTER INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_project_owner_member();

-- ==============================================================================
-- 5. OPPORTUNITIES & EVENTS
-- ==============================================================================
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

CREATE TABLE IF NOT EXISTS public.saved_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_saved_opp UNIQUE (user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_opps_user ON public.saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_opps_opp ON public.saved_opportunities(opportunity_id);

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

-- ==============================================================================
-- 6. CAREERS & APPLICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.career_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    department public.role_department NOT NULL DEFAULT 'ENGINEERING',
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT NOT NULL,
    requirements TEXT NOT NULL,
    nice_to_have TEXT,
    benefits TEXT NOT NULL,
    location TEXT,
    is_remote BOOLEAN NOT NULL DEFAULT true,
    commitment TEXT NOT NULL DEFAULT 'Part-Time / 10-15 hrs/week',
    deadline TIMESTAMPTZ,
    status public.career_role_status NOT NULL DEFAULT 'OPEN',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roles_slug ON public.career_roles(slug);
CREATE INDEX IF NOT EXISTS idx_roles_dept ON public.career_roles(department);
CREATE INDEX IF NOT EXISTS idx_roles_status ON public.career_roles(status);
CREATE INDEX IF NOT EXISTS idx_roles_published ON public.career_roles(is_published);

CREATE TABLE IF NOT EXISTS public.career_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code TEXT UNIQUE NOT NULL,
    role_id UUID NOT NULL REFERENCES public.career_roles(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT,
    name TEXT,
    applicant_name TEXT,
    email TEXT,
    applicant_email TEXT,
    user_email TEXT,
    contact_email TEXT,
    cover_message TEXT NOT NULL,
    what_they_build TEXT NOT NULL,
    experience TEXT NOT NULL,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    resume_path TEXT,
    additional_information TEXT,
    status public.application_status NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_active_role_app UNIQUE (applicant_id, role_id)
);

ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS applicant_name TEXT;
ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS applicant_email TEXT;
ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS contact_email TEXT;

CREATE INDEX IF NOT EXISTS idx_apps_ref ON public.career_applications(reference_code);
CREATE INDEX IF NOT EXISTS idx_apps_role ON public.career_applications(role_id);
CREATE INDEX IF NOT EXISTS idx_apps_applicant ON public.career_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON public.career_applications(status);

CREATE TABLE IF NOT EXISTS public.application_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.career_applications(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_notes_app ON public.application_notes(application_id);

CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.career_applications(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    old_status public.application_status,
    new_status public.application_status NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_history_app ON public.application_status_history(application_id);

CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.application_status_history (application_id, changed_by, old_status, new_status, created_at)
        VALUES (NEW.id, auth.uid(), NULL, NEW.status, now());
    ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.application_status_history (application_id, changed_by, old_status, new_status, created_at)
        VALUES (NEW.id, auth.uid(), OLD.status, NEW.status, now());
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_app_status_changed ON public.career_applications;
CREATE TRIGGER on_app_status_changed
    AFTER INSERT OR UPDATE ON public.career_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_application_status_change();

-- ==============================================================================
-- 7. SUPER ADMIN AUDIT LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.admin_audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.admin_audit_logs (admin_id);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) ENABLEMENT & POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_service_role" ON public.profiles;
CREATE POLICY "profiles_service_role" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Profile Skills & Interests Policies
DROP POLICY IF EXISTS "profile_skills_select" ON public.profile_skills;
CREATE POLICY "profile_skills_select" ON public.profile_skills FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profile_skills_insert_own" ON public.profile_skills;
CREATE POLICY "profile_skills_insert_own" ON public.profile_skills FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "profile_skills_delete_own" ON public.profile_skills;
CREATE POLICY "profile_skills_delete_own" ON public.profile_skills FOR DELETE TO authenticated USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "profile_interests_select" ON public.profile_interests;
CREATE POLICY "profile_interests_select" ON public.profile_interests FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profile_interests_insert_own" ON public.profile_interests;
CREATE POLICY "profile_interests_insert_own" ON public.profile_interests FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "profile_interests_delete_own" ON public.profile_interests;
CREATE POLICY "profile_interests_delete_own" ON public.profile_interests FOR DELETE TO authenticated USING (auth.uid() = profile_id);

-- Projects Policies
DROP POLICY IF EXISTS "projects_select" ON public.projects;
CREATE POLICY "projects_select" ON public.projects FOR SELECT TO anon, authenticated USING (
    is_public = true 
    OR (auth.uid() IS NOT NULL AND (
        owner_id = auth.uid() 
        OR public.is_admin()
        OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = id AND pm.user_id = auth.uid())
    ))
);

DROP POLICY IF EXISTS "projects_insert" ON public.projects;
CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "projects_update" ON public.projects;
CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.is_admin()) WITH CHECK (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "projects_delete" ON public.projects;
CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = owner_id OR public.is_admin());

-- Project Technologies Policies
DROP POLICY IF EXISTS "project_tech_select" ON public.project_technologies;
CREATE POLICY "project_tech_select" ON public.project_technologies FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.is_public = true OR p.owner_id = auth.uid() OR public.is_admin() OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid())))
);

DROP POLICY IF EXISTS "project_tech_modify" ON public.project_technologies;
CREATE POLICY "project_tech_modify" ON public.project_technologies FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.owner_id = auth.uid() OR public.is_admin()))
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.owner_id = auth.uid() OR public.is_admin()))
);

-- Project Members Policies
DROP POLICY IF EXISTS "project_members_select" ON public.project_members;
CREATE POLICY "project_members_select" ON public.project_members FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.is_public = true OR p.owner_id = auth.uid() OR public.is_admin() OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid())))
);

DROP POLICY IF EXISTS "project_members_insert" ON public.project_members;
CREATE POLICY "project_members_insert" ON public.project_members FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.owner_id = auth.uid() OR public.is_admin())) OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "project_members_delete" ON public.project_members;
CREATE POLICY "project_members_delete" ON public.project_members FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.owner_id = auth.uid() OR public.is_admin())) OR auth.uid() = user_id
);

-- Project Updates Policies
DROP POLICY IF EXISTS "project_updates_select" ON public.project_updates;
CREATE POLICY "project_updates_select" ON public.project_updates FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.is_public = true OR p.owner_id = auth.uid() OR public.is_admin() OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid())))
);

DROP POLICY IF EXISTS "project_updates_insert" ON public.project_updates;
CREATE POLICY "project_updates_insert" ON public.project_updates FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = author_id AND EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())
);

DROP POLICY IF EXISTS "project_updates_update" ON public.project_updates;
CREATE POLICY "project_updates_update" ON public.project_updates FOR UPDATE TO authenticated USING (
    author_id = auth.uid() OR public.is_admin() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
) WITH CHECK (
    author_id = auth.uid() OR public.is_admin() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "project_updates_delete" ON public.project_updates;
CREATE POLICY "project_updates_delete" ON public.project_updates FOR DELETE TO authenticated USING (
    author_id = auth.uid() OR public.is_admin() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
);

-- Project Invitations Policies
DROP POLICY IF EXISTS "project_invitations_select" ON public.project_invitations;
CREATE POLICY "project_invitations_select" ON public.project_invitations FOR SELECT TO authenticated USING (
    inviter_id = auth.uid() OR invitee_id = auth.uid() OR public.is_admin() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "project_invitations_insert" ON public.project_invitations;
CREATE POLICY "project_invitations_insert" ON public.project_invitations FOR INSERT TO authenticated WITH CHECK (
    inviter_id = auth.uid() AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "project_invitations_update" ON public.project_invitations;
CREATE POLICY "project_invitations_update" ON public.project_invitations FOR UPDATE TO authenticated USING (
    invitee_id = auth.uid() OR inviter_id = auth.uid() OR public.is_admin() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
) WITH CHECK (
    invitee_id = auth.uid() OR inviter_id = auth.uid() OR public.is_admin() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
);

-- Opportunities Policies
DROP POLICY IF EXISTS "opps_select" ON public.opportunities;
CREATE POLICY "opps_select" ON public.opportunities FOR SELECT TO anon, authenticated USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "opps_admin_modify" ON public.opportunities;
CREATE POLICY "opps_admin_modify" ON public.opportunities FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Saved Opportunities Policies
DROP POLICY IF EXISTS "saved_opps_select" ON public.saved_opportunities;
CREATE POLICY "saved_opps_select" ON public.saved_opportunities FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_opps_insert" ON public.saved_opportunities;
CREATE POLICY "saved_opps_insert" ON public.saved_opportunities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_opps_delete" ON public.saved_opportunities;
CREATE POLICY "saved_opps_delete" ON public.saved_opportunities FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Opportunity Applications Policies
DROP POLICY IF EXISTS "opp_apps_all" ON public.opportunity_applications;
CREATE POLICY "opp_apps_all" ON public.opportunity_applications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Events Policies
DROP POLICY IF EXISTS "events_select" ON public.events;
CREATE POLICY "events_select" ON public.events FOR SELECT TO anon, authenticated USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "events_admin_modify" ON public.events;
CREATE POLICY "events_admin_modify" ON public.events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Event RSVPs Policies
DROP POLICY IF EXISTS "event_rsvps_all" ON public.event_rsvps;
CREATE POLICY "event_rsvps_all" ON public.event_rsvps FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Career Roles Policies
DROP POLICY IF EXISTS "roles_select" ON public.career_roles;
CREATE POLICY "roles_select" ON public.career_roles FOR SELECT TO anon, authenticated USING ((is_published = true AND status = 'OPEN') OR public.is_admin());

DROP POLICY IF EXISTS "roles_admin_modify" ON public.career_roles;
CREATE POLICY "roles_admin_modify" ON public.career_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Career Applications Policies
DROP POLICY IF EXISTS "apps_select" ON public.career_applications;
CREATE POLICY "apps_select" ON public.career_applications FOR SELECT TO authenticated USING (applicant_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "apps_insert" ON public.career_applications;
CREATE POLICY "apps_insert" ON public.career_applications FOR INSERT TO authenticated WITH CHECK (applicant_id = auth.uid());

DROP POLICY IF EXISTS "apps_update" ON public.career_applications;
CREATE POLICY "apps_update" ON public.career_applications FOR UPDATE TO authenticated USING (applicant_id = auth.uid() OR public.is_admin()) WITH CHECK ((applicant_id = auth.uid() AND NEW.status = 'WITHDRAWN') OR public.is_admin());

-- Application Notes Policies
DROP POLICY IF EXISTS "notes_admin_all" ON public.application_notes;
CREATE POLICY "notes_admin_all" ON public.application_notes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Application Status History Policies
DROP POLICY IF EXISTS "history_select" ON public.application_status_history;
CREATE POLICY "history_select" ON public.application_status_history FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.career_applications ca WHERE ca.id = application_id AND ca.applicant_id = auth.uid()) OR public.is_admin()
);

-- Admin Audit Logs Policies
DROP POLICY IF EXISTS "audit_logs_select" ON public.admin_audit_logs;
CREATE POLICY "audit_logs_select" ON public.admin_audit_logs FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_insert" ON public.admin_audit_logs;
CREATE POLICY "audit_logs_insert" ON public.admin_audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = admin_id AND public.is_admin());

-- ==============================================================================
-- 9. STORAGE BUCKETS CONFIGURATION
-- ==============================================================================
-- 1. Avatars Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 2097152, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Project Covers Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-covers', 'project-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 3. Resumes Bucket (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resumes', 'resumes', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760, allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Storage Policies: Avatars
DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
CREATE POLICY "avatars_public_select" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
CREATE POLICY "avatars_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1] OR name LIKE auth.uid()::text || '-%'));

DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
CREATE POLICY "avatars_auth_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1] OR name LIKE auth.uid()::text || '-%'));

DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;
CREATE POLICY "avatars_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1] OR name LIKE auth.uid()::text || '-%'));

-- Storage Policies: Project Covers
DROP POLICY IF EXISTS "project_covers_public_select" ON storage.objects;
CREATE POLICY "project_covers_public_select" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'project-covers');

DROP POLICY IF EXISTS "project_covers_auth_insert" ON storage.objects;
CREATE POLICY "project_covers_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-covers');

DROP POLICY IF EXISTS "project_covers_auth_update" ON storage.objects;
CREATE POLICY "project_covers_auth_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-covers');

DROP POLICY IF EXISTS "project_covers_auth_delete" ON storage.objects;
CREATE POLICY "project_covers_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-covers');

-- Storage Policies: Resumes (Private)
DROP POLICY IF EXISTS "resumes_owner_or_admin_select" ON storage.objects;
CREATE POLICY "resumes_owner_or_admin_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'resumes' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));

DROP POLICY IF EXISTS "resumes_auth_insert" ON storage.objects;
CREATE POLICY "resumes_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "resumes_auth_delete" ON storage.objects;
CREATE POLICY "resumes_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ==============================================================================
-- 10. SUPER ADMIN PROMOTION QUERY (Execute for your account in SQL Editor)
-- ==============================================================================
-- To promote any user account to SUPER_ADMIN, run:
-- UPDATE public.profiles SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
