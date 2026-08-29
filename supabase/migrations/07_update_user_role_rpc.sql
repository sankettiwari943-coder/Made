-- ==============================================================================
-- MADE — MIGRATION 07: SINGLE SUPER ADMIN ROLE UPDATE RPC
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.update_user_role(
    target_user_id UUID,
    new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller_id UUID;
    caller_role TEXT;
    caller_email TEXT;
    target_name TEXT;
    normalized_role TEXT;
    is_authorized BOOLEAN := FALSE;
BEGIN
    caller_id := auth.uid();
    IF caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Retrieve caller info
    SELECT role, email INTO caller_role, caller_email FROM public.profiles WHERE id = caller_id;

    -- Check if caller is Super Admin
    IF caller_role = 'SUPER_ADMIN' OR caller_role = 'super_admin' OR caller_email IN ('sankettiwari943@gmail.com', 'apurvadwivedi666@outlook.com') THEN
        is_authorized := TRUE;
    END IF;

    IF NOT is_authorized THEN
        RAISE EXCEPTION 'Unauthorized: Only Super Admin can change user roles.';
    END IF;

    normalized_role := UPPER(new_role);
    IF normalized_role NOT IN ('MEMBER', 'ADMIN', 'SUPER_ADMIN', 'USER', 'BUILDER') THEN
        RAISE EXCEPTION 'Invalid role specified: %', new_role;
    END IF;

    -- Map USER/BUILDER to MEMBER for database user_role enum compatibility
    IF normalized_role IN ('USER', 'BUILDER') THEN
        normalized_role := 'MEMBER';
    END IF;

    SELECT full_name INTO target_name FROM public.profiles WHERE id = target_user_id;

    -- If elevating to SUPER_ADMIN, ensure single Super Admin rule: demote caller to ADMIN
    IF normalized_role = 'SUPER_ADMIN' AND caller_id != target_user_id THEN
        -- Demote current Super Admin to ADMIN
        UPDATE public.profiles
        SET role = 'ADMIN', updated_at = NOW()
        WHERE id = caller_id;

        -- Promote target user to SUPER_ADMIN
        UPDATE public.profiles
        SET role = 'SUPER_ADMIN', updated_at = NOW()
        WHERE id = target_user_id;

        -- Log audit trail
        INSERT INTO public.admin_audit_logs (admin_id, action, entity_type, entity_id, metadata)
        VALUES (
            caller_id,
            'SUPER_ADMIN_TRANSFERRED',
            'BUILDER',
            target_user_id::TEXT,
            jsonb_build_object(
                'target_name', COALESCE(target_name, 'Unknown'),
                'new_role', 'SUPER_ADMIN',
                'demoted_admin_id', caller_id
            )
        );

        RETURN jsonb_build_object(
            'success', true,
            'message', format('Super Admin privileges transferred to %s. Your account is now Admin.', COALESCE(target_name, 'user'))
        );
    ELSE
        -- Standard role update
        UPDATE public.profiles
        SET role = normalized_role, updated_at = NOW()
        WHERE id = target_user_id;

        -- Log audit trail
        INSERT INTO public.admin_audit_logs (admin_id, action, entity_type, entity_id, metadata)
        VALUES (
            caller_id,
            'USER_ROLE_UPDATED',
            'BUILDER',
            target_user_id::TEXT,
            jsonb_build_object(
                'target_name', COALESCE(target_name, 'Unknown'),
                'new_role', normalized_role
            )
        );

        RETURN jsonb_build_object(
            'success', true,
            'message', format('Role updated to [%s] for %s.', normalized_role, COALESCE(target_name, 'builder'))
        );
    END IF;
END;
$$;
