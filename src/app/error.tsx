'use client';

import React, { useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error internally without exposing sensitive payloads
    console.error('System Exception Caught:', error.message);
  }, [error]);

  return (
    <div style={{ padding: 'var(--space-28) 0', textAlign: 'center', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <Container size="narrow">
        <span className="technical-label" style={{ color: 'var(--color-danger)', display: 'block', marginBottom: 'var(--space-3)' }}>
          [ SYSTEM ANOMALY DETECTED ]
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          Something went wrong.
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            maxWidth: '500px',
            margin: 'var(--space-6) auto var(--space-10)',
            lineHeight: 1.6,
          }}
        >
          An unexpected application exception occurred. We have logged the event trace for diagnosis.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              padding: '10px 20px',
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--bg-canvas)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
            }}
          >
            RETRY SYSTEM REQUEST →
          </button>
          <Button href="/" variant="outline" size="md">
            Back to Safety
          </Button>
        </div>
      </Container>
    </div>
  );
}
