'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { LoginSchema } from '@/lib/auth/validations';
import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/brand/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || '/dashboard';
  const urlError = searchParams.get('error');

  const { isConfigured } = getSupabaseEnv();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(urlError);
  const [isLoading, setIsLoading] = useState(false);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const validationResult = LoginSchema.safeParse({ email, password });
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setGeneralError('Invalid email or password. Please verify your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setGeneralError('Your email address is not yet verified. Please check your inbox or request a new verification link.');
        } else {
          setGeneralError(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.session) {
        router.push(nextParam);
        router.refresh();
      }
    } catch {
      setGeneralError('A network error occurred while establishing authentication session.');
      setIsLoading(false);
    }
  };

  return (
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
            fontSize: '1.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            marginTop: 'var(--space-4)',
            letterSpacing: '-0.02em',
          }}
        >
          Sign In to MADE
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
          Enter your verified email to access your workspace.
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
          label="Email Address"
          type="email"
          placeholder="builder@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          disabled={isLoading}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
          <Link
            href="/forgot-password"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            Forgot password?
          </Link>
        </div>

        <Button
          variant="primary"
          size="lg"
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
          disabled={isLoading}
        >
          {isLoading ? 'Authenticating...' : 'Sign In'}
        </Button>
      </form>

      <div
        style={{
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Don’t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}>
            Join MADE
          </Link>
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ padding: 'var(--space-20) 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container size="narrow">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </Container>
    </div>
  );
}
