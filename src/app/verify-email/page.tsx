'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const { isConfigured } = getSupabaseEnv();

  const [cooldown, setCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  const handleResend = async () => {
    if (cooldown > 0 || !emailParam) return;

    setIsResending(true);
    setResendStatus(null);
    const supabase = createClient();

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailParam,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setResendStatus(`Error: ${error.message}`);
      } else {
        setResendStatus('Verification link dispatched. Check your inbox.');
        setCooldown(60); // 60s cooldown
      }
    } catch {
      setResendStatus('Network error while requesting verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-technical)',
        borderRadius: 'var(--radius-xs)',
        padding: 'var(--space-10) var(--space-8)',
        maxWidth: '520px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Logo variant="wordmark" height={28} />
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          fontWeight: 700,
          padding: '2px 8px',
          backgroundColor: 'rgba(30, 90, 255, 0.1)',
          border: '1px solid rgba(30, 90, 255, 0.3)',
          color: 'var(--accent-primary-hover)',
          borderRadius: 'var(--radius-xs)',
          letterSpacing: '0.1em',
          marginBottom: 'var(--space-4)',
        }}
      >
        [ VERIFICATION REQUIRED ]
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          marginBottom: 'var(--space-3)',
        }}
      >
        Check Your Inbox.
      </h1>

      <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
        We sent a secure verification link to:
      </p>

      <div
        style={{
          backgroundColor: 'var(--bg-canvas)',
          border: '1px solid var(--border-technical)',
          borderRadius: 'var(--radius-xs)',
          padding: 'var(--space-3) var(--space-4)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
          wordBreak: 'break-all',
          marginBottom: 'var(--space-6)',
        }}
      >
        {emailParam || 'your registered email address'}
      </div>

      <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
        Click the link in the email to activate your account. You will be automatically redirected to your builder dashboard.
      </p>

      {resendStatus && (
        <div
          style={{
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-2) var(--space-3)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: resendStatus.startsWith('Error') ? 'var(--color-danger)' : 'var(--color-success)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {resendStatus}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Button
          variant="primary"
          size="md"
          onClick={handleResend}
          disabled={isResending || cooldown > 0 || !emailParam}
          style={{ width: '100%' }}
        >
          {cooldown > 0
            ? `RESEND EMAIL (${cooldown}s)`
            : isResending
            ? 'DISPATCHING...'
            : 'RESEND EMAIL'}
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
          <Link
            href="/signup"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            ← CHANGE EMAIL
          </Link>
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            BACK TO SIGN IN →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div style={{ padding: 'var(--space-20) 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container size="narrow">
        <Suspense fallback={null}>
          <VerifyEmailContent />
        </Suspense>
      </Container>
    </div>
  );
}
