'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { ForgotPasswordSchema } from '@/lib/auth/validations';
import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/brand/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

export default function ForgotPasswordPage() {
  const { isConfigured } = getSupabaseEnv();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validationResult = ForgotPasswordSchema.safeParse({ email });
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const origin = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccessMessage('Password recovery link dispatched. If an account exists for this address, you will receive an email shortly.');
      }
    } catch {
      setError('A network error occurred while requesting password recovery.');
    } finally {
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
              Reset Password
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
              Enter your account email to receive a secure recovery link.
            </p>
          </div>

          {error && (
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
              [ ERROR ]: {error}
            </div>
          )}

          {successMessage ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--color-success)',
                  borderRadius: 'var(--radius-xs)',
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-6)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-success)',
                  lineHeight: 1.6,
                }}
              >
                [ SUCCESS ]: {successMessage}
              </div>

              <Link
                href="/login"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                ← Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="Registered Email"
                type="email"
                placeholder="builder@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />

              <Button
                variant="primary"
                size="lg"
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
                disabled={isLoading}
              >
                {isLoading ? 'Dispatching...' : 'Send Recovery Link'}
              </Button>

              <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                <Link
                  href="/login"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </Container>
    </div>
  );
}
