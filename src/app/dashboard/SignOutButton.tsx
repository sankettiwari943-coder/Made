'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export const SignOutButton: React.FC = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? 'SIGNING OUT...' : 'SIGN OUT'}
    </Button>
  );
};
