import React from 'react';
import { notFound } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { Event } from '@/lib/supabase/types';
import { EventEditForm } from './EventEditForm';

export default async function EditEventPage({ params }: { params: { id: string } }) {
  await requireSuperAdmin();

  const supabase = createClient();

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !event) {
    notFound();
  }

  return <EventEditForm initialEvent={event as Event} />;
}
