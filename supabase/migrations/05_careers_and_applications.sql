-- ==============================================================================
-- MADE — SUPABASE DATABASE MIGRATION: CAREERS & APPLICATIONS
-- Phase 6: Career Roles, Applications, Resumes, Notes & Status History
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE public.role_department AS ENUM (
        'ENGINEERING', 'AI_ML', 'DESIGN', 'CYBERSECURITY', 'CONTENT', 'COMMUNITY', 'OPERATIONS', 'RESEARCH', 'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.career_role_status AS ENUM (
        'OPEN', 'PAUSED', 'CLOSED', 'ARCHIVED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.application_status AS ENUM (
        'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Career Roles Table
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

-- 3. Career Applications Table
CREATE TABLE IF NOT EXISTS public.career_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code TEXT UNIQUE NOT NULL,
    role_id UUID NOT NULL REFERENCES public.career_roles(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_apps_ref ON public.career_applications(reference_code);
CREATE INDEX IF NOT EXISTS idx_apps_role ON public.career_applications(role_id);
CREATE INDEX IF NOT EXISTS idx_apps_applicant ON public.career_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON public.career_applications(status);

-- 4. Application Notes Table (Admin Only)
CREATE TABLE IF NOT EXISTS public.application_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.career_applications(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_notes_app ON public.application_notes(application_id);

-- 5. Application Status History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.career_applications(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    old_status public.application_status,
    new_status public.application_status NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_history_app ON public.application_status_history(application_id);

-- 6. Trigger for Automated Status History Recording
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

-- 7. Enable Row Level Security
ALTER TABLE public.career_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

-- 8. Career Roles RLS Policies
DROP POLICY IF EXISTS "roles_select" ON public.career_roles;
CREATE POLICY "roles_select"
    ON public.career_roles
    FOR SELECT
    TO anon, authenticated
    USING (
        (is_published = true AND status = 'OPEN') 
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "roles_admin_modify" ON public.career_roles;
CREATE POLICY "roles_admin_modify"
    ON public.career_roles
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 9. Career Applications RLS Policies
DROP POLICY IF EXISTS "apps_select" ON public.career_applications;
CREATE POLICY "apps_select"
    ON public.career_applications
    FOR SELECT
    TO authenticated
    USING (
        applicant_id = auth.uid() 
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "apps_insert" ON public.career_applications;
CREATE POLICY "apps_insert"
    ON public.career_applications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        applicant_id = auth.uid()
    );

DROP POLICY IF EXISTS "apps_update" ON public.career_applications;
CREATE POLICY "apps_update"
    ON public.career_applications
    FOR UPDATE
    TO authenticated
    USING (
        applicant_id = auth.uid() 
        OR public.is_admin()
    )
    WITH CHECK (
        -- Applicants can only change status to WITHDRAWN
        (applicant_id = auth.uid() AND NEW.status = 'WITHDRAWN')
        OR public.is_admin()
    );

-- 10. Application Notes RLS Policies (Admin Only)
DROP POLICY IF EXISTS "notes_admin_all" ON public.application_notes;
CREATE POLICY "notes_admin_all"
    ON public.application_notes
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 11. Application Status History RLS Policies
DROP POLICY IF EXISTS "history_select" ON public.application_status_history;
CREATE POLICY "history_select"
    ON public.application_status_history
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.career_applications ca
            WHERE ca.id = application_id AND ca.applicant_id = auth.uid()
        )
        OR public.is_admin()
    );

-- 12. Storage Bucket for Private Resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    false, -- Private bucket
    10485760, -- 10MB limit
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO UPDATE
SET 
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

-- 13. Storage Policies for 'resumes'
DROP POLICY IF EXISTS "resumes_owner_or_admin_select" ON storage.objects;
CREATE POLICY "resumes_owner_or_admin_select"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'resumes' AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR public.is_admin()
        )
    );

DROP POLICY IF EXISTS "resumes_auth_insert" ON storage.objects;
CREATE POLICY "resumes_auth_insert"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "resumes_auth_delete" ON storage.objects;
CREATE POLICY "resumes_auth_delete"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
