-- ==============================================================================
-- MADE — SUPABASE DATABASE MIGRATION: PROJECTS, COLLABORATION & BUILD LOGS
-- Phase 4: Project Management, Relational Tech Stack, Members, Invitations & Logs
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE public.project_status AS ENUM ('IDEA', 'BUILDING', 'PROTOTYPE', 'LIVE', 'OPEN_SOURCE', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.project_member_role AS ENUM ('OWNER', 'COLLABORATOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Projects Table
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

-- 3. Project Technologies Table
CREATE TABLE IF NOT EXISTS public.project_technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    technology TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_project_tech UNIQUE (project_id, technology)
);

CREATE INDEX IF NOT EXISTS idx_project_tech_project ON public.project_technologies(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tech_tech ON public.project_technologies(technology);

-- 4. Project Members Table
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

-- 5. Project Updates / Build Logs Table
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

-- 6. Project Invitations Table
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

-- 7. Automatic Owner Membership Trigger
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

-- 8. Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- 9. Projects RLS Policies
-- SELECT: Public projects are visible to all. Private projects visible only to owner and members.
DROP POLICY IF EXISTS "projects_select" ON public.projects;
CREATE POLICY "projects_select"
    ON public.projects
    FOR SELECT
    TO anon, authenticated
    USING (
        is_public = true 
        OR (auth.uid() IS NOT NULL AND (
            owner_id = auth.uid() 
            OR EXISTS (
                SELECT 1 FROM public.project_members pm 
                WHERE pm.project_id = id AND pm.user_id = auth.uid()
            )
        ))
    );

-- INSERT: Authenticated users can create projects where owner_id = auth.uid()
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
CREATE POLICY "projects_insert"
    ON public.projects
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- UPDATE: Only project owner can update project
DROP POLICY IF EXISTS "projects_update" ON public.projects;
CREATE POLICY "projects_update"
    ON public.projects
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- DELETE: Only project owner can delete project
DROP POLICY IF EXISTS "projects_delete" ON public.projects;
CREATE POLICY "projects_delete"
    ON public.projects
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- 10. Project Technologies RLS Policies
DROP POLICY IF EXISTS "project_tech_select" ON public.project_technologies;
CREATE POLICY "project_tech_select"
    ON public.project_technologies
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND (
                p.is_public = true 
                OR p.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.project_members pm 
                    WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
                )
            )
        )
    );

DROP POLICY IF EXISTS "project_tech_modify" ON public.project_technologies;
CREATE POLICY "project_tech_modify"
    ON public.project_technologies
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
    );

-- 11. Project Members RLS Policies
DROP POLICY IF EXISTS "project_members_select" ON public.project_members;
CREATE POLICY "project_members_select"
    ON public.project_members
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND (
                p.is_public = true 
                OR p.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.project_members pm 
                    WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
                )
            )
        )
    );

DROP POLICY IF EXISTS "project_members_insert" ON public.project_members;
CREATE POLICY "project_members_insert"
    ON public.project_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Owner adding members, or trigger execution
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
        OR auth.uid() = user_id
    );

DROP POLICY IF EXISTS "project_members_delete" ON public.project_members;
CREATE POLICY "project_members_delete"
    ON public.project_members
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
        OR auth.uid() = user_id
    );

-- 12. Project Updates (Build Logs) RLS Policies
DROP POLICY IF EXISTS "project_updates_select" ON public.project_updates;
CREATE POLICY "project_updates_select"
    ON public.project_updates
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND (
                p.is_public = true 
                OR p.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.project_members pm 
                    WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
                )
            )
        )
    );

-- INSERT: Must be Owner or Collaborator in project_members
DROP POLICY IF EXISTS "project_updates_insert" ON public.project_updates;
CREATE POLICY "project_updates_insert"
    ON public.project_updates
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = author_id AND
        EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
        )
    );

-- UPDATE/DELETE: Must be author or Project Owner
DROP POLICY IF EXISTS "project_updates_update" ON public.project_updates;
CREATE POLICY "project_updates_update"
    ON public.project_updates
    FOR UPDATE
    TO authenticated
    USING (
        author_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        author_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "project_updates_delete" ON public.project_updates;
CREATE POLICY "project_updates_delete"
    ON public.project_updates
    FOR DELETE
    TO authenticated
    USING (
        author_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
    );

-- 13. Project Invitations RLS Policies
DROP POLICY IF EXISTS "project_invitations_select" ON public.project_invitations;
CREATE POLICY "project_invitations_select"
    ON public.project_invitations
    FOR SELECT
    TO authenticated
    USING (
        inviter_id = auth.uid() 
        OR invitee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "project_invitations_insert" ON public.project_invitations;
CREATE POLICY "project_invitations_insert"
    ON public.project_invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        inviter_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "project_invitations_update" ON public.project_invitations;
CREATE POLICY "project_invitations_update"
    ON public.project_invitations
    FOR UPDATE
    TO authenticated
    USING (
        invitee_id = auth.uid() 
        OR inviter_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        invitee_id = auth.uid() 
        OR inviter_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
    );

-- 14. Supabase Storage Bucket for Project Cover Images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-covers',
    'project-covers',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 15. Storage Policies for 'project-covers'
DROP POLICY IF EXISTS "project_covers_public_select" ON storage.objects;
CREATE POLICY "project_covers_public_select"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'project-covers');

DROP POLICY IF EXISTS "project_covers_auth_insert" ON storage.objects;
CREATE POLICY "project_covers_auth_insert"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'project-covers');

DROP POLICY IF EXISTS "project_covers_auth_update" ON storage.objects;
CREATE POLICY "project_covers_auth_update"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'project-covers');

DROP POLICY IF EXISTS "project_covers_auth_delete" ON storage.objects;
CREATE POLICY "project_covers_auth_delete"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'project-covers');
