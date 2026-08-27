import React from 'react';
import { requireSuperAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { CareerApplication } from '@/lib/supabase/types';
import { AdminApplicationsClient } from './AdminApplicationsClient';

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams?: { roleId?: string; status?: string };
}) {
  await requireSuperAdmin();

  const supabase = createClient();

  let applications: CareerApplication[] = [];
  try {
    let query = supabase
      .from('career_applications')
      .select('*, role:career_roles(*), applicant:profiles(id, full_name, username, avatar_url, email)')
      .order('created_at', { ascending: false });

    if (searchParams?.roleId) {
      query = query.eq('role_id', searchParams.roleId);
    }

    if (searchParams?.status) {
      query = query.eq('status', searchParams.status);
    }

    const { data } = await query;
    if (data) {
      applications = data as CareerApplication[];
    }
  } catch {
    applications = [];
  }

  return <AdminApplicationsClient initialApplications={applications} initialFilterStatus={searchParams?.status || 'ALL'} />;
}
