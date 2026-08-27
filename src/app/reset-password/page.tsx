'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { ResetPasswordSchema } from '@/lib/auth/validations';
import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/brand/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { isConfigured } = getSupabaseEnv();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const validationResult = ResetPasswordSchema.safeParse({ password, confirmPassword });
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setGeneralError(error.message);
        setIsLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setGeneralError('Network error while updating password.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-20) 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container size="narrow">
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-10) var(--space-8)',
            maxWidth: '460px',
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
            <Logo variant="wordmark" height={28} />
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                marginTop: 'var(--space-4)',
                letterSpacing: '-0.02em',
              }}
            >
              New Password
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
              Set a new secure password for your account.
            </p>
          </div>

          {generalError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-xs)',
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: 'var(--space-6)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-danger)',
                lineHeight: 1.5,
              }}
            >
              [ ERROR ]: {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              helperText="Must include uppercase and at least one number."
              required
              disabled={isLoading}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
              disabled={isLoading}
            />

            <Button
              variant="primary"
              size="lg"
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
              disabled={isLoading}
            >
              {isLoading ? 'Updating Password...' : 'Save New Password'}
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}
