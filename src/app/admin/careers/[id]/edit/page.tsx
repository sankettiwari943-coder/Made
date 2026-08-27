import React from 'react';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { CareerRole } from '@/lib/supabase/types';
import { CareerRoleEditForm } from './CareerRoleEditForm';

export default async function EditCareerRolePage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const supabase = createClient();

  const { data: role, error } = await supabase
    .from('career_roles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !role) {
    notFound();
  }

  return <CareerRoleEditForm initialRole={role as CareerRole} />;
}
