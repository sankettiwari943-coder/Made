-- ==============================================================================
-- MADE — SUPABASE DATABASE MIGRATION: PROFILES, SKILLS, ONBOARDING & STORAGE
-- Phase 3: Extended Profile Attributes, Relational Skills/Interests, and Avatars
-- ==============================================================================

-- 1. Extend Profiles Table with Phase 3 Attributes
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS primary_focus TEXT,
    ADD COLUMN IF NOT EXISTS github_url TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS current_build TEXT,
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Add index on onboarding status and primary focus for builders directory
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_focus ON public.profiles(primary_focus);

-- 2. Create Relational Profile Skills Table
CREATE TABLE IF NOT EXISTS public.profile_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_profile_skill UNIQUE (profile_id, skill)
);

CREATE INDEX IF NOT EXISTS idx_profile_skills_profile ON public.profile_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_skill ON public.profile_skills(skill);

-- 3. Create Relational Profile Interests Table
CREATE TABLE IF NOT EXISTS public.profile_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interest TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_profile_interest UNIQUE (profile_id, interest)
);

CREATE INDEX IF NOT EXISTS idx_profile_interests_profile ON public.profile_interests(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_interests_interest ON public.profile_interests(interest);

-- 4. Enable Row Level Security on New Tables
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for profile_skills
-- Select: Publicly viewable for verified builder profiles
DROP POLICY IF EXISTS "profile_skills_select" ON public.profile_skills;
CREATE POLICY "profile_skills_select"
    ON public.profile_skills
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Insert: Users can only add skills to their own profile
DROP POLICY IF EXISTS "profile_skills_insert_own" ON public.profile_skills;
CREATE POLICY "profile_skills_insert_own"
    ON public.profile_skills
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = profile_id);

-- Delete: Users can only delete skills from their own profile
DROP POLICY IF EXISTS "profile_skills_delete_own" ON public.profile_skills;
CREATE POLICY "profile_skills_delete_own"
    ON public.profile_skills
    FOR DELETE
    TO authenticated
    USING (auth.uid() = profile_id);

-- 6. RLS Policies for profile_interests
-- Select: Publicly viewable
DROP POLICY IF EXISTS "profile_interests_select" ON public.profile_interests;
CREATE POLICY "profile_interests_select"
    ON public.profile_interests
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Insert: Users can only add interests to their own profile
DROP POLICY IF EXISTS "profile_interests_insert_own" ON public.profile_interests;
CREATE POLICY "profile_interests_insert_own"
    ON public.profile_interests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = profile_id);

-- Delete: Users can only delete interests from their own profile
DROP POLICY IF EXISTS "profile_interests_delete_own" ON public.profile_interests;
CREATE POLICY "profile_interests_delete_own"
    ON public.profile_interests
    FOR DELETE
    TO authenticated
    USING (auth.uid() = profile_id);

-- 7. Supabase Storage Bucket for Profile Avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET 
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 8. Storage RLS Policies for 'avatars' Bucket
-- Anyone can view avatar images
DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
CREATE POLICY "avatars_public_select"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatars
DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
CREATE POLICY "avatars_auth_insert"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' AND 
        (auth.uid()::text = (storage.foldername(name))[1] OR name LIKE auth.uid()::text || '-%')
    );

-- Authenticated users can update/replace their own avatars
DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
CREATE POLICY "avatars_auth_update"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND 
        (auth.uid()::text = (storage.foldername(name))[1] OR name LIKE auth.uid()::text || '-%')
    );

-- Authenticated users can delete their own avatars
DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;
CREATE POLICY "avatars_auth_delete"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND 
        (auth.uid()::text = (storage.foldername(name))[1] OR name LIKE auth.uid()::text || '-%')
    );
