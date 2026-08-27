import { createClient } from '../supabase/server';
import { AdminAuditAction, AdminAuditLog } from '../supabase/types';

/**
 * Record an administrative action into the audit logs table
 */
export async function recordAdminAuditLog(
  adminId: string,
  action: AdminAuditAction | string,
  entityType: 'CAREER' | 'OPPORTUNITY' | 'EVENT' | 'PROJECT' | 'BUILDER' | 'APPLICATION' | 'NOTE' | 'SETTINGS',
  entityId: string | null,
  metadata: Record<string, any> = {}
): Promise<void> {
  const supabase = createClient();

  try {
    await supabase.from('admin_audit_logs').insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to write admin audit log:', err);
  }
}

/**
 * Fetch recent admin audit logs for the Control Center
 */
export async function getRecentAdminAuditLogs(limit = 10): Promise<AdminAuditLog[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('id, admin_id, action, entity_type, entity_id, metadata, created_at, admin:profiles(id, full_name, username, role)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data as any[];
  } catch {
    return [];
  }
}

export interface PlatformMetrics {
  totalProjects: number;
  publicProjects: number;
  totalBuilders: number;
  openCareerRoles: number;
  totalOpportunities: number;
  upcomingEvents: number;
  totalApplications: number;
  pendingApplications: number;
}

/**
 * Calculate live platform metrics exclusively from database records
 */
export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  const supabase = createClient();

  try {
    const [
      { count: totalProjects },
      { count: publicProjects },
      { count: totalBuilders },
      { count: openCareerRoles },
      { count: totalOpportunities },
      { count: upcomingEvents },
      { count: totalApplications },
      { count: pendingApplications },
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_public', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('onboarding_completed', true),
      supabase.from('career_roles').select('*', { count: 'exact', head: true }).eq('status', 'OPEN').eq('is_published', true),
      supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('is_published', true).gte('start_at', new Date().toISOString()),
      supabase.from('career_applications').select('*', { count: 'exact', head: true }),
      supabase.from('career_applications').select('*', { count: 'exact', head: true }).in('status', ['SUBMITTED', 'UNDER_REVIEW']),
    ]);

    return {
      totalProjects: totalProjects || 0,
      publicProjects: publicProjects || 0,
      totalBuilders: totalBuilders || 0,
      openCareerRoles: openCareerRoles || 0,
      totalOpportunities: totalOpportunities || 0,
      upcomingEvents: upcomingEvents || 0,
      totalApplications: totalApplications || 0,
      pendingApplications: pendingApplications || 0,
    };
  } catch {
    return {
      totalProjects: 0,
      publicProjects: 0,
      totalBuilders: 0,
      openCareerRoles: 0,
      totalOpportunities: 0,
      upcomingEvents: 0,
      totalApplications: 0,
      pendingApplications: 0,
    };
  }
}
