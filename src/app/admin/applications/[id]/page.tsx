import React from 'react';
import { notFound } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { CareerApplication, ApplicationNote, ApplicationStatusHistory } from '@/lib/supabase/types';
import { ApplicationDossierClient } from './ApplicationDossierClient';

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = await requireSuperAdmin();

  const supabase = createClient();

  const [appRes, notesRes, historyRes] = await Promise.all([
    supabase
      .from('career_applications')
      .select('*, role:career_roles(*), applicant:profiles(*), profiles:profiles(*)')
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

  const applicationData = appRes.data as any;
  if (applicationData.applicant && !applicationData.profiles) {
    applicationData.profiles = applicationData.applicant;
  } else if (applicationData.profiles && !applicationData.applicant) {
    applicationData.applicant = applicationData.profiles;
  }

  let initialNotes: ApplicationNote[] = (notesRes.data || []) as ApplicationNote[];
  if (initialNotes.length === 0 && (applicationData.admin_notes || applicationData.internal_notes)) {
    const singleNote = applicationData.internal_notes || applicationData.admin_notes;
    if (singleNote) {
      initialNotes = [
        {
          id: 'single-app-note',
          application_id: params.id,
          author_id: admin.id,
          content: singleNote,
          note: singleNote,
          author_name: 'Admin',
          created_at: applicationData.updated_at || new Date().toISOString(),
          updated_at: applicationData.updated_at || new Date().toISOString(),
          author: { full_name: 'Admin' } as any,
        },
      ];
    }
  }

  return (
    <ApplicationDossierClient
      initialApplication={applicationData as CareerApplication}
      initialNotes={initialNotes}
      initialHistory={(historyRes.data || []) as ApplicationStatusHistory[]}
      adminId={admin.id}
    />
  );
}
