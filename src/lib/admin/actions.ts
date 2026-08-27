'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '../supabase/server';
import { requireSuperAdmin } from '../auth/authorization';
import { recordAdminAuditLog } from './audit';
import { ApplicationStatus, CareerRoleStatus, OpportunityStatus, UserRole } from '../supabase/types';


/**
 * Super Admin: Create or update a career role
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
}) {
  const admin = await requireSuperAdmin();
  const supabase = createClient();

  const payload = {
    title: formData.title.trim(),
    slug: formData.slug.trim().toLowerCase(),
    department: formData.department,
    short_description: formData.short_description.trim(),
    description: formData.description.trim(),
    responsibilities: formData.responsibilities.trim(),
    requirements: formData.requirements.trim(),
    nice_to_have: formData.nice_to_have?.trim() || null,
    benefits: formData.benefits.trim(),
    location: formData.location?.trim() || null,
    is_remote: formData.is_remote,
    commitment: formData.commitment.trim(),
    deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
    status: formData.status,
    is_published: formData.is_published,
    created_by: admin.id,
    updated_at: new Date().toISOString(),
  };

  if (formData.id) {
    const { error } = await supabase
      .from('career_roles')
      .update(payload)
      .eq('id', formData.id);

    if (error) throw new Error(error.message);

    await recordAdminAuditLog(
      admin.id,
      formData.is_published ? 'CAREER_PUBLISHED' : 'CAREER_UPDATED',
      'CAREER',
      formData.id,
      { title: payload.title, slug: payload.slug, status: payload.status }
    );
  } else {
    const { data, error } = await supabase
      .from('career_roles')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    await recordAdminAuditLog(
      admin.id,
      'CAREER_CREATED',
      'CAREER',
      data.id,
      { title: payload.title, slug: payload.slug }
    );
  }

  revalidatePath('/careers');
  revalidatePath(`/careers/${payload.slug}`);
  revalidatePath('/admin/careers');
  revalidatePath('/admin');
  return { success: true, slug: payload.slug };
}

/**
 * Super Admin: Delete / Archive a career role
 */
export async function deleteCareerRoleAction(roleId: string, roleTitle: string) {
  const admin = await requireSuperAdmin();
  const supabase = createClient();

  const { error } = await supabase
    .from('career_roles')
    .delete()
    .eq('id', roleId);

  if (error) throw new Error(error.message);

  await recordAdminAuditLog(admin.id, 'CAREER_DELETED', 'CAREER', roleId, { title: roleTitle });

  revalidatePath('/careers');
  revalidatePath('/admin/careers');
  revalidatePath('/admin');
  return { success: true };
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
) {
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

  if (appError) throw new Error(appError.message);

  // 2. Write status history record
  await supabase.from('application_status_history').insert({
    application_id: applicationId,
    changed_by: admin.id,
    old_status: oldStatus,
    new_status: newStatus,
    created_at: new Date().toISOString(),
  });

  // 3. Write audit log
  await recordAdminAuditLog(
    admin.id,
    'APPLICATION_STATUS_CHANGED',
    'APPLICATION',
    applicationId,
    { applicant: applicantName, oldStatus, newStatus }
  );

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath('/admin/applications');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * Super Admin: Add private internal note to an application
 */
export async function addApplicationNoteAction(applicationId: string, content: string) {
  const admin = await requireSuperAdmin();
  const supabase = createClient();

  const cleanContent = content.trim();
  if (!cleanContent) throw new Error('Note content cannot be empty');

  const { data, error } = await supabase
    .from('application_notes')
    .insert({
      application_id: applicationId,
      author_id: admin.id,
      content: cleanContent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  await recordAdminAuditLog(
    admin.id,
    'APPLICATION_NOTE_ADDED',
    'NOTE',
    data.id,
    { applicationId }
  );

  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: true, id: data.id };
}

/**
 * Super Admin: Delete private internal note
 */
export async function deleteApplicationNoteAction(noteId: string, applicationId: string) {
  const admin = await requireSuperAdmin();
  const supabase = createClient();

  const { error } = await supabase
    .from('application_notes')
    .delete()
    .eq('id', noteId)
    .eq('author_id', admin.id);

  if (error) throw new Error(error.message);

  await recordAdminAuditLog(admin.id, 'APPLICATION_NOTE_DELETED', 'NOTE', noteId, { applicationId });

  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: true };
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
  newRole: UserRole,
  builderName?: string
) {
  const admin = await requireSuperAdmin();
  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('profiles')
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetUserId);

  if (error) throw new Error(error.message);

  await recordAdminAuditLog(
    admin.id,
    'USER_ROLE_UPDATED',
    'BUILDER',
    targetUserId,
    { builderName: builderName || 'Builder', newRole }
  );

  revalidatePath('/admin/builders');
  revalidatePath('/admin');
  revalidatePath('/builders');
  return { success: true };
}

