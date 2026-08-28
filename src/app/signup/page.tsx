'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { SignUpSchema } from '@/lib/auth/validations';
import { signUpAction, checkEmailExistsAction } from '@/lib/auth/actions';
import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/brand/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

export default function SignUpPage() {
  const router = useRouter();
  const { isConfigured } = getSupabaseEnv();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 1. Navigation & Route Guard: Redirect already authenticated users to workspace / dashboard
  useEffect(() => {
    if (!isConfigured) {
      setIsCheckingAuth(false);
      return;
    }

    const checkExistingAuth = async () => {
      try {
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
            router.replace('/workspace');
            return;
          } else if (profile) {
            router.replace('/workspace');
            return;
          } else {
            router.replace('/onboarding');
            return;
          }
        }
      } catch {
        // Continue to sign up form if session check fails
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [isConfigured, router]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  if (isCheckingAuth) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="technical-label">VERIFYING MEMBERSHIP CREDENTIALS...</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setAccountExists(false);

    // Validate inputs with Zod
    const validationResult = SignUpSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });

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

    try {
      // 2. Pre-check email existence via Server Action
      const { exists } = await checkEmailExistsAction(email);
      if (exists) {
        setAccountExists(true);
        setGeneralError('An account with this email already exists. Please sign in instead.');
        setIsLoading(false);
        return;
      }

      // 3. Execute Server Action Registration Guard
      const origin = window.location.origin;
      const result = await signUpAction({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        origin,
      });

      if (!result.success) {
        if (result.code === 'ACCOUNT_EXISTS') {
          setAccountExists(true);
          setGeneralError('An account with this email already exists. Please sign in instead.');
        } else {
          setGeneralError(result.error || 'Failed to create account.');
        }
        setIsLoading(false);
        return;
      }

      // Check if user is created and verification is needed
      if (result.user) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch {
      setGeneralError('A network error occurred while connecting to authentication services.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-20) 0', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <Container size="narrow">
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-10) var(--space-8)',
            maxWidth: '480px',
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
              Join MADE
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
              Create your account to start building, collaborating, and shipping.
            </p>
          </div>

          {/* Account Exists Friendly Notice & Sign In CTA */}
          {accountExists && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--accent-primary)',
                borderRadius: 'var(--radius-xs)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
                <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
                  [ ACCOUNT REGISTERED ]
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
                An account with this email already exists. Please sign in instead.
              </p>
              <Button href={`/sign-in?email=${encodeURIComponent(email)}`} variant="primary" size="sm" showArrow style={{ width: '100%' }}>
                Sign In to Your Account
              </Button>
            </div>
          )}

          {generalError && !accountExists && (
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
              label="Full Name"
              type="text"
              placeholder="Sanket Tiwari"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              required
              disabled={isLoading}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="builder@university.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (accountExists) setAccountExists(false);
              }}
              error={errors.email}
              required
              disabled={isLoading}
            />

            <Input
              label="Password"
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
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
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
              Already registered?{' '}
              <Link href="/sign-in" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}>
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </Container>
    </div>
  );
}

