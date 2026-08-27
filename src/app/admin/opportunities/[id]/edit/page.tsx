import React from 'react';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { Opportunity } from '@/lib/supabase/types';
import { OpportunityEditForm } from './OpportunityEditForm';

export default async function EditOpportunityPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const supabase = createClient();

  const { data: opp, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !opp) {
    notFound();
  }

  return <OpportunityEditForm initialOpp={opp as Opportunity} />;
}
