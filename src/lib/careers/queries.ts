import { createClient } from '../supabase/server';
import { CareerRole, CareerApplication, ApplicationNote, ApplicationStatusHistory } from '../supabase/types';

/**
 * Fetch all published & open career roles
 */
export async function getPublicCareerRoles(): Promise<CareerRole[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('career_roles')
      .select('*')
      .eq('is_published', true)
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data as CareerRole[];
  } catch {
    return [];
  }
}

/**
 * Fetch single career role by unique slug
 */
export async function getCareerRoleBySlug(slug: string): Promise<CareerRole | null> {
  const supabase = createClient();
  const cleanSlug = slug.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('career_roles')
      .select('*')
      .eq('slug', cleanSlug)
      .single();

    if (error || !data) {
      return null;
    }

    return data as CareerRole;
  } catch {
    return null;
  }
}

/**
 * Check if a user has already submitted an active application for a specific role
 */
export async function hasUserAppliedForRole(userId: string, roleId: string): Promise<{ applied: boolean; application?: CareerApplication }> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('career_applications')
      .select('*, role:career_roles(*)')
      .eq('applicant_id', userId)
      .eq('role_id', roleId)
      .maybeSingle();

    if (error || !data) {
      return { applied: false };
    }

    return { applied: true, application: data as any };
  } catch {
    return { applied: false };
  }
}

/**
 * Fetch all applications submitted by an applicant
 */
export async function getUserApplications(userId: string): Promise<CareerApplication[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('career_applications')
      .select('id, reference_code, role_id, applicant_id, status, created_at, updated_at, role:career_roles(*)')
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as unknown as CareerApplication[];
  } catch {
    return [];
  }
}

/**
 * Fetch a single application by ID for the applicant
 */
export async function getUserApplicationById(applicationId: string, userId: string): Promise<CareerApplication | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('career_applications')
      .select('id, reference_code, role_id, applicant_id, cover_message, what_they_build, experience, github_url, linkedin_url, portfolio_url, resume_path, additional_information, status, created_at, updated_at, role:career_roles(*)')
      .eq('id', applicationId)
      .eq('applicant_id', userId)
      .single();

    if (error || !data) return null;
    return data as unknown as CareerApplication;
  } catch {
    return null;
  }
}

/**
 * Fetch application status history for applicant
 */
export async function getApplicationStatusHistory(applicationId: string): Promise<ApplicationStatusHistory[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('application_status_history')
      .select('id, application_id, changed_by, old_status, new_status, created_at')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data as ApplicationStatusHistory[];
  } catch {
    return [];
  }
}

/**
 * Admin: Fetch all applications across all roles
 */
export async function getAdminApplications(): Promise<CareerApplication[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('career_applications')
      .select('id, reference_code, role_id, applicant_id, status, created_at, updated_at, role:career_roles(*), applicant:profiles(id, full_name, username, email, avatar_url, primary_focus)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as any[];
  } catch {
    return [];
  }
}

/**
 * Admin: Fetch full application detail by ID with applicant profile
 */
export async function getAdminApplicationById(applicationId: string): Promise<CareerApplication | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('career_applications')
      .select('*, role:career_roles(*), applicant:profiles(*)')
      .eq('id', applicationId)
      .single();

    if (error || !data) return null;
    return data as any;
  } catch {
    return null;
  }
}

/**
 * Admin: Fetch internal notes for an application
 */
export async function getApplicationNotes(applicationId: string): Promise<ApplicationNote[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('application_notes')
      .select('id, application_id, author_id, content, created_at, updated_at, author:profiles(id, full_name, username, role)')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as any[];
  } catch {
    return [];
  }
}
