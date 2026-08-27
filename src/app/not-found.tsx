import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: '404 // Page Not Found | MADE',
  description: 'The requested system route does not exist.',
};

export default function NotFound() {
  return (
    <div style={{ padding: 'var(--space-28) 0', textAlign: 'center', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <Container size="narrow">
        <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-3)' }}>
          [ 404 ERROR // ROUTE NOT FOUND ]
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            lineHeight: 0.95,
          }}
        >
          Nothing <br />
          <span style={{ color: 'var(--accent-primary-hover)' }}>here yet.</span>
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            maxWidth: '480px',
            margin: 'var(--space-6) auto var(--space-10)',
            lineHeight: 1.6,
          }}
        >
          The coordinate or system path you requested does not exist or has been relocated.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
          <Button href="/" variant="primary" size="md" showArrow>
            BACK TO MADE
          </Button>
          <Button href="/projects" variant="outline" size="md">
            Explore Projects
          </Button>
        </div>
      </Container>
    </div>
  );
}
