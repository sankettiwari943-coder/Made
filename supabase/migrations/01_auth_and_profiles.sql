-- ==============================================================================
-- MADE — SUPABASE DATABASE MIGRATION: AUTH & PROFILES
-- Phase 2: User Profiles, Roles, and Row Level Security
-- ==============================================================================

-- 1. Create Enum for User Roles
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('MEMBER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    role public.user_role NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast username and id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Automatic Profile Creation Trigger
-- When a user registers through Supabase Auth (auth.users), automatically create a public.profiles record
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
    -- Extract full name from raw_user_meta_data or fallback
    derived_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    
    -- Generate initial unique username candidate from email prefix + random suffix
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

-- Trigger to execute upon auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Role Protection Trigger (Prevent Privilege Escalation via Client Update)
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- If the role is being changed, verify that the caller is executing with elevated service-role privileges
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF auth.role() != 'service_role' THEN
            RAISE EXCEPTION 'Unauthorized: Role modification is restricted to administrative workflows.';
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

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Row Level Security Policies
-- Policy: Users can read their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Policy: Public can read basic profile info of verified users
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public"
    ON public.profiles
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy: Users can update ONLY their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Service role has full unrestricted access
DROP POLICY IF EXISTS "profiles_service_role" ON public.profiles;
CREATE POLICY "profiles_service_role"
    ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
