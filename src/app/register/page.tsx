import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RegisterPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();

    if (profile && profile.onboarding_completed) {
      redirect('/workspace');
    } else if (profile) {
      redirect('/workspace');
    } else {
      redirect('/onboarding');
    }
  }

  redirect('/signup');
}
