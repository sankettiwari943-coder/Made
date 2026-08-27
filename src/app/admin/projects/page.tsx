import React from 'react';
import { requireSuperAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { ProjectWithDetails } from '@/lib/supabase/types';
import { AdminProjectsClient } from './AdminProjectsClient';

export default async function AdminProjectsPage() {
  await requireSuperAdmin();

  const supabase = createClient();

  let projects: ProjectWithDetails[] = [];
  try {
    const { data } = await supabase
      .from('projects')
      .select('*, owner:profiles(id, full_name, username, avatar_url)')
      .order('created_at', { ascending: false });

    if (data) {
      projects = data as ProjectWithDetails[];
    }
  } catch {
    projects = [];
  }

  return <AdminProjectsClient initialProjects={projects} />;
}
