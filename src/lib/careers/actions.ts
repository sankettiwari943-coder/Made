'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import { CareerApplicationSchema, generateReferenceCode } from './validations';

export interface SubmitApplicationResult {
  success: boolean;
  referenceCode?: string;
  applicationId?: string;
  error?: string;
  code?: string;
  status?: number;
  existingApplicationId?: string;
  existingStatus?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface CheckExistingApplicationResult {
  exists: boolean;
  application?: {
    id: string;
    reference_code: string;
    status: string;
    created_at: string;
  } | null;
}

/**
 * Server Action: Submit a new career application with server-side duplicate prevention guards
 */
export async function submitCareerApplicationAction(formData: {
  role_id: string;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  applicant_email?: string | null;
  applicant_id?: string | null;
  user_id?: string | null;
  cover_message: string;
  what_they_build: string;
  experience: string;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  resume_path?: string | null;
  resume_url?: string | null;
  resume?: string | null;
  cv_url?: string | null;
  file_url?: string | null;
  additional_information?: string | null;
}): Promise<SubmitApplicationResult> {
  try {
    const supabase = createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required. Please log in to submit your application.',
        status: 401,
        code: 'UNAUTHENTICATED',
      };
    }

    // 2. Validate input schema with Zod
    const validationResult = CareerApplicationSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || 'Invalid application payload.';
      return {
        success: false,
        error: firstError,
        fieldErrors,
        status: 400,
        code: 'VALIDATION_ERROR',
      };
    }

    const payload = validationResult.data;
    const candidateEmail = (payload.email || payload.applicant_email || formData.email || user.email || '')
      .trim()
      .toLowerCase();

    const resolvedFullName = (payload.full_name || payload.name || formData.full_name || '').trim();

    // 3. Server-Side Guard: Query for existing application for this role_id and applicant_id OR email
    let checkQuery = supabase
      .from('career_applications')
      .select('id, reference_code, status, applicant_id, email, created_at')
      .eq('role_id', formData.role_id);

    if (candidateEmail) {
      checkQuery = checkQuery.or(
        `applicant_id.eq.${user.id},email.eq.${candidateEmail},applicant_email.eq.${candidateEmail},user_email.eq.${candidateEmail},contact_email.eq.${candidateEmail}`
      );
    } else {
      checkQuery = checkQuery.eq('applicant_id', user.id);
    }

    const { data: existingApp, error: checkError } = await checkQuery
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!checkError && existingApp) {
      return {
        success: false,
        error: 'You have already applied for this role.',
        code: 'ALREADY_APPLIED',
        status: 409,
        existingApplicationId: existingApp.id,
        existingStatus: existingApp.status,
      };
    }

    // 4. Generate reference code
    const refCode = generateReferenceCode();

    // 5. Insert new application row with database unique constraint error handling
    const resumeVal =
      formData.resume_url ||
      formData.resume ||
      formData.cv_url ||
      formData.file_url ||
      formData.resume_path ||
      null;

    const insertPayload: Record<string, any> = {
      reference_code: refCode,
      role_id: formData.role_id,
      applicant_id: user.id,
      full_name: resolvedFullName || null,
      name: resolvedFullName || null,
      applicant_name: resolvedFullName || null,
      email: candidateEmail || null,
      applicant_email: candidateEmail || null,
      user_email: candidateEmail || null,
      contact_email: candidateEmail || null,
      cover_message: payload.cover_message,
      what_they_build: payload.what_they_build,
      experience: payload.experience,
      github_url: payload.github_url || null,
      linkedin_url: payload.linkedin_url || null,
      portfolio_url: payload.portfolio_url || null,
      resume_path: resumeVal,
      resume_url: resumeVal,
      resume: resumeVal,
      cv_url: resumeVal,
      file_url: resumeVal,
      additional_information: payload.additional_information || null,
      status: 'SUBMITTED',
    };

    let { data: newApp, error: insertError } = await supabase
      .from('career_applications')
      .insert(insertPayload)
      .select('id, reference_code, status')
      .single();

    if (insertError && (insertError.message?.includes('column') || insertError.code === 'PGRST204')) {
      // Fallback if specific resume columns are not in existing database table
      const fallbackPayload = {
        reference_code: refCode,
        role_id: formData.role_id,
        applicant_id: user.id,
        full_name: resolvedFullName || null,
        name: resolvedFullName || null,
        applicant_name: resolvedFullName || null,
        email: candidateEmail || null,
        applicant_email: candidateEmail || null,
        user_email: candidateEmail || null,
        contact_email: candidateEmail || null,
        cover_message: payload.cover_message,
        what_they_build: payload.what_they_build,
        experience: payload.experience,
        github_url: payload.github_url || null,
        linkedin_url: payload.linkedin_url || null,
        portfolio_url: payload.portfolio_url || null,
        resume_path: resumeVal,
        additional_information: payload.additional_information || null,
        status: 'SUBMITTED',
      };

      const fallbackResult = await supabase
        .from('career_applications')
        .insert(fallbackPayload)
        .select('id, reference_code, status')
        .single();

      if (!fallbackResult.error && fallbackResult.data) {
        newApp = fallbackResult.data;
        insertError = null;
      }
    }

    if (insertError) {
      // Catch unique constraint violations gracefully
      if (
        insertError.code === '23505' ||
        insertError.message?.toLowerCase().includes('duplicate key') ||
        insertError.message?.toLowerCase().includes('uq_user_active_role_app')
      ) {
        return {
          success: false,
          error: 'You have already applied for this role.',
          code: 'ALREADY_APPLIED',
          status: 409,
        };
      }

      return {
        success: false,
        error: `Database error: ${insertError.message}`,
        status: 500,
        code: 'DATABASE_ERROR',
      };
    }

    revalidatePath('/careers');
    revalidatePath('/dashboard/applications');
    revalidatePath('/admin/applications');

    return {
      success: true,
      referenceCode: newApp?.reference_code || refCode,
      applicationId: newApp?.id,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during submission.',
      status: 500,
      code: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Server Action: Fast Pre-Submission Check for active application by role and authenticated user / email
 */
export async function checkExistingCareerApplicationAction(
  roleId: string,
  email?: string | null
): Promise<CheckExistingApplicationResult> {
  if (!roleId) return { exists: false };

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const candidateEmail = (email || user?.email || '').trim().toLowerCase();

    if (!user && !candidateEmail) {
      return { exists: false };
    }

    let query = supabase
      .from('career_applications')
      .select('id, reference_code, status, created_at')
      .eq('role_id', roleId);

    if (user && candidateEmail) {
      query = query.or(
        `applicant_id.eq.${user.id},email.eq.${candidateEmail},applicant_email.eq.${candidateEmail},user_email.eq.${candidateEmail},contact_email.eq.${candidateEmail}`
      );
    } else if (user) {
      query = query.eq('applicant_id', user.id);
    } else if (candidateEmail) {
      query = query.or(
        `email.eq.${candidateEmail},applicant_email.eq.${candidateEmail},user_email.eq.${candidateEmail},contact_email.eq.${candidateEmail}`
      );
    }

    const { data: existingApp, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !existingApp) {
      return { exists: false, application: null };
    }

    return {
      exists: true,
      application: {
        id: existingApp.id,
        reference_code: existingApp.reference_code,
        status: existingApp.status,
        created_at: existingApp.created_at,
      },
    };
  } catch {
    return { exists: false, application: null };
  }
}
