import React from 'react';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { CareerApplication, ApplicationNote, ApplicationStatusHistory } from '@/lib/supabase/types';
import { ApplicationDossierClient } from './ApplicationDossierClient';

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = await requireAdmin();
  const supabase = createClient();

  const [appRes, notesRes, historyRes] = await Promise.all([
    supabase
      .from('career_applications')
      .select('*, role:career_roles(*), applicant:profiles(*)')
      .eq('id', params.id)
      .single(),
    supabase
      .from('application_notes')
      .select('*, author:profiles(id, full_name, username, role)')
      .eq('application_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('application_status_history')
      .select('*, changer:profiles(id, full_name, username, role)')
      .eq('application_id', params.id)
      .order('created_at', { ascending: false }),
  ]);

  if (appRes.error || !appRes.data) {
    notFound();
  }

  return (
    <ApplicationDossierClient
      initialApplication={appRes.data as CareerApplication}
      initialNotes={(notesRes.data || []) as ApplicationNote[]}
      initialHistory={(historyRes.data || []) as ApplicationStatusHistory[]}
      adminId={admin.id}
    />
  );
}
