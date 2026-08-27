-- ==============================================================================
-- MADE — MIGRATION 06: SUPER ADMIN AUDIT LOGS & EXPANDED CONTROL POLICIES
-- ==============================================================================

-- 1. Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index audit logs for rapid chronological retrieval and entity lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.admin_audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.admin_audit_logs (admin_id);

-- Enable RLS on audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. RLS for admin_audit_logs:
-- Only SUPER_ADMIN and ADMIN can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON public.admin_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'SUPER_ADMIN' OR profiles.role = 'ADMIN')
        )
    );

-- Only authenticated admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
    ON public.admin_audit_logs
    FOR INSERT
    WITH CHECK (
        auth.uid() = admin_id
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'SUPER_ADMIN' OR profiles.role = 'ADMIN')
        )
    );

-- 3. Super Admin CRUD Policies for Opportunities & Events
-- Opportunities admin policies:
CREATE POLICY "Admins can insert opportunities"
    ON public.opportunities
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'SUPER_ADMIN' OR profiles.role = 'ADMIN')
        )
    );

CREATE POLICY "Admins can update all opportunities"
    ON public.opportunities
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'SUPER_ADMIN' OR profiles.role = 'ADMIN')
        )
    );

CREATE POLICY "Admins can delete opportunities"
    ON public.opportunities
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'SUPER_ADMIN' OR profiles.role = 'ADMIN')
        )
    );

-- Events admin policies:
CREATE POLICY "Admins can insert events"
    ON public.events
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'SUPER_ADMIN' OR profiles.role = 'ADMIN')
        )
    );

CREATE POLICY "Admins can update all events"
    ON public.events
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'SUPER_ADMIN' OR profiles.role = 'ADMIN')
        )
    );

CREATE POLICY "Admins can delete events"
    ON public.events
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'SUPER_ADMIN' OR profiles.role = 'ADMIN')
        )
    );

-- 4. Projects admin moderation policies:
CREATE POLICY "Admins can view all projects"
    ON public.projects
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'SUPER_ADMIN' OR profiles.role = 'ADMIN')
        )
    );

CREATE POLICY "Admins can moderate projects"
    ON public.projects
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'SUPER_ADMIN' OR profiles.role = 'ADMIN')
        )
    );
