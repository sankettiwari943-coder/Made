import React from 'react';
import Link from 'next/link';
import { Container } from '../layout/Container';
import { Logo } from '../brand/Logo';

export const SystemConfigRequired: React.FC = () => {
  return (
    <div style={{ padding: 'var(--space-20) 0', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <Container size="narrow">
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-10) var(--space-8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
            <Logo variant="wordmark" height={26} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                padding: '2px 8px',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                color: 'var(--status-idea)',
                borderRadius: 'var(--radius-xs)',
                fontWeight: 700,
                letterSpacing: '0.1em',
              }}
            >
              [ CONFIGURATION REQUIRED ]
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Supabase Infrastructure Setup
          </h2>

          <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
            Authentication is powered exclusively by Supabase Auth and Row Level Security. To activate login, registration, email verification, and session persistence, provide your Supabase credentials in <code>.env.local</code>.
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-4) var(--space-6)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-6)',
              lineHeight: 1.6,
            }}
          >
            <div style={{ color: 'var(--text-dim)', marginBottom: 'var(--space-2)' }}># Add to .env.local:</div>
            <div><span style={{ color: 'var(--accent-primary-hover)' }}>NEXT_PUBLIC_SUPABASE_URL</span>=&quot;https://your-project.supabase.co&quot;</div>
            <div><span style={{ color: 'var(--accent-primary-hover)' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=&quot;eyJhbGciOi...&quot;</div>
            <div><span style={{ color: 'var(--accent-primary-hover)' }}>SUPABASE_SERVICE_ROLE_KEY</span>=&quot;eyJhbGciOi...&quot;</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              See <strong style={{ color: 'var(--text-primary)' }}>SETUP.md</strong> for database migration instructions.
            </span>
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
              }}
            >
              ← Return to Platform Home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};
