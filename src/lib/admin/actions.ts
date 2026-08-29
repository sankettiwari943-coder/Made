'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '../supabase/server';
import { requireSuperAdmin } from '../auth/authorization';
import { recordAdminAuditLog } from './audit';
import { ApplicationStatus, CareerRoleStatus, OpportunityStatus, RoleDepartment, UserRole } from '../supabase/types';
import { CareerRoleSchema } from '../careers/validations';

export interface SaveRoleResult {
  success: boolean;
  slug?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Super Admin: Create or update a career role with safe error boundaries
 */
export async function saveCareerRoleAction(formData: {
  id?: string;
  title: string;
  slug: string;
  department: string;
  short_description: string;
  description: string;
  responsibilities: string;
  requirements: string;
  nice_to_have?: string | null;
  benefits: string;
  location?: string | null;
  is_remote: boolean;
  commitment: string;
  deadline?: string | null;
  status: CareerRoleStatus;
  is_published: boolean;
}): Promise<SaveRoleResult> {
  try {
    // 1. Authorization check
    let admin;
    try {
      admin = await requireSuperAdmin();
    } catch (authErr: any) {
      return {
        success: false,
        error: authErr.message || 'Unauthorized: SUPER_ADMIN role clearance required.',
      };
    }

    // 2. Validate input schema with Zod
    const validationResult = CareerRoleSchema.safeParse({
      title: formData.title,
      department: formData.department,
      short_description: formData.short_description,
      description: formData.description,
      responsibilities: formData.responsibilities,
      requirements: formData.requirements,
      nice_to_have: formData.nice_to_have || '',
      benefits: formData.benefits,
      location: formData.location || '',
      is_remote: formData.is_remote,
      commitment: formData.commitment,
      deadline: formData.deadline || '',
      status: formData.status,
      is_published: formData.is_published,
    });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || 'Invalid input data';
      return {
        success: false,
        error: firstError,
        fieldErrors,
      };
    }

    // 3. Safe date conversion
    let formattedDeadline: string | null = null;
    if (formData.deadline && formData.deadline.trim()) {
      const parsedDate = new Date(formData.deadline);
      if (isNaN(parsedDate.getTime())) {
        return {
          success: false,
          error: 'Application deadline must be a valid date.',
        };
      }
      formattedDeadline = parsedDate.toISOString();
    }

    // 4. Build database payload
    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim().toLowerCase(),
      department: formData.department as RoleDepartment,
      short_description: formData.short_description.trim(),
      description: formData.description.trim(),
      responsibilities: formData.responsibilities.trim(),
      requirements: formData.requirements.trim(),
      nice_to_have: formData.nice_to_have?.trim() || null,
      benefits: formData.benefits.trim(),
      location: formData.location?.trim() || null,
      is_remote: formData.is_remote,
      commitment: formData.commitment.trim() || 'Part-Time / 10-15 hrs/week',
      deadline: formattedDeadline,
      status: formData.status,
      is_published: formData.is_published,
      created_by: admin.id,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();

    // 5. Insert or Update
    if (formData.id) {
      const { error } = await supabase
        .from('career_roles')
        .update(payload)
        .eq('id', formData.id);

      if (error) {
        return { success: false, error: `Database Error: ${error.message}` };
      }

      try {
        await recordAdminAuditLog(
          admin.id,
          formData.is_published ? 'CAREER_PUBLISHED' : 'CAREER_UPDATED',
          'CAREER',
          formData.id,
          { title: payload.title, slug: payload.slug, status: payload.status }
        );
      } catch (auditErr) {
        console.error('Failed to log admin audit:', auditErr);
      }
    } else {
      const { data, error } = await supabase
        .from('career_roles')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'A role with this URL slug already exists. Please choose a different slug.' };
        }
        return { success: false, error: `Database Error: ${error.message}` };
      }

      try {
        await recordAdminAuditLog(
          admin.id,
          'CAREER_CREATED',
          'CAREER',
          data.id,
          { title: payload.title, slug: payload.slug }
        );
      } catch (auditErr) {
        console.error('Failed to log admin audit:', auditErr);
      }
    }

    // 6. Cache revalidation
    revalidatePath('/careers');
    revalidatePath(`/careers/${payload.slug}`);
    revalidatePath('/admin/careers');
    revalidatePath('/admin');

    return { success: true, slug: payload.slug };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while saving the career role.',
    };
  }
}

/**
 * Super Admin: Delete / Archive a career role
 */
export async function deleteCareerRoleAction(roleId: string, roleTitle: string): Promise<{ success: boolean; error?: string }> {
  try {
    let admin;
    try {
      admin = await requireSuperAdmin();
    } catch (authErr: any) {
      return {
        success: false,
        error: authErr.message || 'Unauthorized: SUPER_ADMIN role clearance required.',
      };
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('career_roles')
      .delete()
      .eq('id', roleId);

    if (error) {
      return { success: false, error: `Database Error: ${error.message}` };
    }

    try {
      await recordAdminAuditLog(admin.id, 'CAREER_DELETED', 'CAREER', roleId, { title: roleTitle });
    } catch (auditErr) {
      console.error('Failed to log admin audit:', auditErr);
    }

    revalidatePath('/careers');
    revalidatePath('/admin/careers');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while deleting the career role.',
    };
  }
}

/**
 * Super Admin: Create or update an opportunity
 */
export async function saveOpportunityAction(formData: {
  id?: string;
  title: string;
  slug: string;
  organization: string;
  short_description: string;
  description: string;
  type: string;
  location?: string | null;
  is_remote: boolean;
  application_url?: string | null;
  deadline?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: OpportunityStatus;
  cover_image?: string | null;
  is_published: boolean;
}) {
  const admin = await requireSuperAdmin();
  const supabase = createClient();

  const payload = {
    title: formData.title.trim(),
    slug: formData.slug.trim().toLowerCase(),
    organization: formData.organization.trim(),
    short_description: formData.short_description.trim(),
    description: formData.description.trim(),
    type: formData.type,
    location: formData.location?.trim() || null,
    is_remote: formData.is_remote,
    application_url: formData.application_url?.trim() || null,
    deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
    start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
    end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    status: formData.status,
    cover_image: formData.cover_image?.trim() || null,
    is_published: formData.is_published,
    created_by: admin.id,
    updated_at: new Date().toISOString(),
  };

  if (formData.id) {
    const { error } = await supabase
      .from('opportunities')
      .update(payload)
      .eq('id', formData.id);

    if (error) throw new Error(error.message);

    await recordAdminAuditLog(
      admin.id,
      formData.is_published ? 'OPPORTUNITY_PUBLISHED' : 'OPPORTUNITY_UPDATED',
      'OPPORTUNITY',
      formData.id,
      { title: payload.title, slug: payload.slug }
    );
  } else {
    const { data, error } = await supabase
      .from('opportunities')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    await recordAdminAuditLog(
      admin.id,
      'OPPORTUNITY_CREATED',
      'OPPORTUNITY',
      data.id,
      { title: payload.title, slug: payload.slug }
    );
  }

  revalidatePath('/opportunities');
  revalidatePath(`/opportunities/${payload.slug}`);
  revalidatePath('/admin/opportunities');
  revalidatePath('/admin');
  return { success: true, slug: payload.slug };
}

/**
 * Super Admin: Delete an opportunity
 */
export async function deleteOpportunityAction(opportunityId: string, title: string) {
  const admin = await requireSuperAdmin();
  const supabase = createClient();

  const { error } = await supabase
    .from('opportunities')
    .delete()
    .eq('id', opportunityId);

  if (error) throw new Error(error.message);

  await recordAdminAuditLog(admin.id, 'OPPORTUNITY_DELETED', 'OPPORTUNITY', opportunityId, { title });

  revalidatePath('/opportunities');
  revalidatePath('/admin/opportunities');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * Super Admin: Create or update an event
 */
export async function saveEventAction(formData: {
  id?: string;
  title: string;
  slug: string;
  organizer: string;
  short_description: string;
  description: string;
  event_type: string;
  location?: string | null;
  is_remote: boolean;
  start_at: string;
  end_at?: string | null;
  registration_url?: string | null;
  cover_image?: string | null;
  is_published: boolean;
}) {
  const admin = await requireSuperAdmin();
  const supabase = createClient();

  const payload = {
    title: formData.title.trim(),
    slug: formData.slug.trim().toLowerCase(),
    organizer: formData.organizer.trim(),
    short_description: formData.short_description.trim(),
    description: formData.description.trim(),
    event_type: formData.event_type,
    location: formData.location?.trim() || null,
    is_remote: formData.is_remote,
    start_at: new Date(formData.start_at).toISOString(),
    end_at: formData.end_at ? new Date(formData.end_at).toISOString() : null,
    registration_url: formData.registration_url?.trim() || null,
    cover_image: formData.cover_image?.trim() || null,
    is_published: formData.is_published,
    created_by: admin.id,
    updated_at: new Date().toISOString(),
  };

  if (formData.id) {
    const { error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', formData.id);

    if (error) throw new Error(error.message);

    await recordAdminAuditLog(
      admin.id,
      formData.is_published ? 'EVENT_PUBLISHED' : 'EVENT_UPDATED',
      'EVENT',
      formData.id,
      { title: payload.title, slug: payload.slug }
    );
  } else {
    const { data, error } = await supabase
      .from('events')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    await recordAdminAuditLog(
      admin.id,
      'EVENT_CREATED',
      'EVENT',
      data.id,
      { title: payload.title, slug: payload.slug }
    );
  }

  revalidatePath('/events');
  revalidatePath(`/events/${payload.slug}`);
  revalidatePath('/admin/events');
  revalidatePath('/admin');
  return { success: true, slug: payload.slug };
}

/**
 * Super Admin: Delete an event
 */
export async function deleteEventAction(eventId: string, title: string) {
  const admin = await requireSuperAdmin();
  const supabase = createClient();

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) throw new Error(error.message);

  await recordAdminAuditLog(admin.id, 'EVENT_DELETED', 'EVENT', eventId, { title });

  revalidatePath('/events');
  revalidatePath('/admin/events');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * Super Admin: Moderate / Toggle public visibility of a project
 */
export async function moderateProjectVisibilityAction(projectId: string, isPublic: boolean, title: string) {
  const admin = await requireSuperAdmin();
  const supabase = createClient();

  const { error } = await supabase
    .from('projects')
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq('id', projectId);

  if (error) throw new Error(error.message);

  await recordAdminAuditLog(
    admin.id,
    'PROJECT_MODERATED',
    'PROJECT',
    projectId,
    { title, is_public: isPublic }
  );

  revalidatePath('/projects');
  revalidatePath('/admin/projects');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * Super Admin: Update career application status
 */
export async function updateApplicationStatusAction(
  applicationId: string,
  newStatus: ApplicationStatus,
  oldStatus: ApplicationStatus | null,
  applicantName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireSuperAdmin();
    const supabase = createClient();

    // 1. Update application record
    const { error: appError } = await supabase
      .from('career_applications')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (appError) {
      return { success: false, error: appError.message };
    }

    // 2. Write status history record
    try {
      await supabase.from('application_status_history').insert({
        application_id: applicationId,
        changed_by: admin.id,
        old_status: oldStatus,
        new_status: newStatus,
        created_at: new Date().toISOString(),
      });
    } catch (histErr) {
      console.warn('Status history insert error:', histErr);
    }

    // 3. Write audit log
    try {
      await recordAdminAuditLog(
        admin.id,
        'APPLICATION_STATUS_CHANGED',
        'APPLICATION',
        applicationId,
        { applicant: applicantName, oldStatus, newStatus }
      );
    } catch (auditErr) {
      console.warn('Audit log error:', auditErr);
    }

    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath('/admin/applications');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to update application status:', err);
    return { success: false, error: err.message || 'Failed to update application status' };
  }
}

export interface SaveNoteResult {
  success?: boolean;
  id?: string;
  error?: string;
}

/**
 * Super Admin: Add private internal note to an application
 * Gracefully updates text columns on career_applications and inserts relational record in application_notes
 */
export async function addApplicationNoteAction(
  applicationId: string,
  content: string
): Promise<SaveNoteResult> {
  try {
    let admin;
    try {
      admin = await requireSuperAdmin();
    } catch (authErr: any) {
      return {
        error: authErr.message || 'Unauthorized: SUPER_ADMIN role clearance required.',
      };
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const noteText = (content || '').trim();
    if (!noteText) {
      return { error: 'Note content cannot be empty' };
    }

    // Update text columns on career_applications
    try {
      const { error: updateError } = await supabase
        .from('career_applications')
        .update({
          admin_notes: noteText,
          internal_notes: noteText,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (updateError) {
        console.warn('Could not update text columns on career_applications:', updateError.message);
      }
    } catch (updateErr: any) {
      console.warn('career_applications update note column error:', updateErr?.message);
    }

    // If application_notes table exists, insert an entry
    let noteId = String(Date.now());
    try {
      const authorId = admin?.id || user?.id;
      const authorName =
        (admin as any)?.full_name ||
        (admin as any)?.name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        'Admin';

      const { data, error: insertError } = await supabase
        .from('application_notes')
        .insert({
          application_id: applicationId,
          author_id: authorId,
          author_name: authorName,
          content: noteText,
          note: noteText,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError) {
        // Fallback for minimal column schema
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('application_notes')
          .insert({
            application_id: applicationId,
            author_id: authorId,
            content: noteText,
          })
          .select('id')
          .single();

        if (fallbackError) {
          console.warn('application_notes insert fallback warning:', fallbackError.message);
        } else if (fallbackData?.id) {
          noteId = fallbackData.id;
        }
      } else if (data?.id) {
        noteId = data.id;
      }
    } catch (insertErr: any) {
      console.warn('application_notes insert exception:', insertErr?.message);
    }

    // Write audit log
    try {
      await recordAdminAuditLog(
        admin?.id || user?.id || 'admin',
        'APPLICATION_NOTE_ADDED',
        'NOTE',
        noteId,
        { applicationId, note: noteText }
      );
    } catch (auditErr) {
      console.error('Failed to log admin audit:', auditErr);
    }

    revalidatePath(`/admin/applications/${applicationId}`);
    return { success: true, id: noteId };
  } catch (err: any) {
    console.error('Failed to save admin note:', err);
    return { error: err.message || 'Failed to save note' };
  }
}

/**
 * Aliases for saving admin notes
 */
export const addAdminNote = addApplicationNoteAction;
export const updateApplicationNotes = addApplicationNoteAction;

/**
 * Super Admin: Delete private internal note
 */
export async function deleteApplicationNoteAction(
  noteId: string,
  applicationId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    let admin;
    try {
      admin = await requireSuperAdmin();
    } catch (authErr: any) {
      return {
        error: authErr.message || 'Unauthorized: SUPER_ADMIN role clearance required.',
      };
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('application_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      return { error: error.message };
    }

    try {
      await recordAdminAuditLog(admin.id, 'APPLICATION_NOTE_DELETED', 'NOTE', noteId, { applicationId });
    } catch (auditErr) {
      console.error('Failed to log admin audit:', auditErr);
    }

    revalidatePath(`/admin/applications/${applicationId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete admin note:', err);
    return { error: err.message || 'Failed to delete note' };
  }
}

/**
 * Super Admin: Generate a secure time-limited signed URL for private resume access
 */
export async function getSecureResumeDownloadUrl(resumePath: string): Promise<string> {
  await requireSuperAdmin();
  const supabase = createClient();

  // Create signed URL valid for 300 seconds (5 minutes)
  const { data, error } = await supabase.storage
    .from('resumes')
    .createSignedUrl(resumePath, 300);

  if (error || !data?.signedUrl) {
    throw new Error('Failed to generate secure resume URL or resume does not exist');
  }

  return data.signedUrl;
}

/**
 * Super Admin: Update a builder's system role (MEMBER, ADMIN, SUPER_ADMIN)
 */
export async function updateBuilderRoleAction(
  targetUserId: string,
  newRole: UserRole | string,
  builderName?: string
) {
  const admin = await requireSuperAdmin();
  const serviceClient = createServiceClient();
  const supabase = createClient();

  const normalizedRole = (newRole || '').toUpperCase() as UserRole;

  // 1. Attempt RPC call if available
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('update_user_role', {
      target_user_id: targetUserId,
      new_role: normalizedRole,
    });

    if (!rpcError && rpcData) {
      revalidatePath('/admin/builders');
      revalidatePath('/admin/settings');
      revalidatePath('/admin');
      revalidatePath('/builders');
      return { success: true, message: (rpcData as any)?.message || 'Role updated' };
    }
  } catch (rpcErr) {
    console.warn('[updateBuilderRoleAction] RPC call fallback:', rpcErr);
  }

  // 2. Direct server-level execution enforcing Single Super Admin rule
  if (normalizedRole === 'SUPER_ADMIN' && admin.id !== targetUserId) {
    // Demote current Super Admin to ADMIN
    await serviceClient
      .from('profiles')
      .update({
        role: 'ADMIN',
        updated_at: new Date().toISOString(),
      })
      .eq('id', admin.id);

    // Promote target user to SUPER_ADMIN
    const { error: targetError } = await serviceClient
      .from('profiles')
      .update({
        role: 'SUPER_ADMIN',
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId);

    if (targetError) throw new Error(targetError.message);

    await recordAdminAuditLog(
      admin.id,
      'SUPER_ADMIN_TRANSFERRED',
      'BUILDER',
      targetUserId,
      {
        builderName: builderName || 'Builder',
        newRole: 'SUPER_ADMIN',
        demotedAdminId: admin.id,
      }
    );

    revalidatePath('/admin/builders');
    revalidatePath('/admin/settings');
    revalidatePath('/admin');
    revalidatePath('/builders');
    return {
      success: true,
      message: `Super Admin transferred to ${builderName || 'user'}. Your account is now Admin.`,
    };
  } else {
    const { error } = await serviceClient
      .from('profiles')
      .update({
        role: normalizedRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId);

    if (error) throw new Error(error.message);

    await recordAdminAuditLog(
      admin.id,
      'USER_ROLE_UPDATED',
      'BUILDER',
      targetUserId,
      { builderName: builderName || 'Builder', newRole: normalizedRole }
    );

    revalidatePath('/admin/builders');
    revalidatePath('/admin/settings');
    revalidatePath('/admin');
    revalidatePath('/builders');
    return {
      success: true,
      message: `Role updated to [${normalizedRole}] for ${builderName || 'builder'}.`,
    };
  }
}


