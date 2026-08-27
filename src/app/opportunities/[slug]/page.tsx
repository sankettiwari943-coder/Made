import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOpportunityBySlug } from '@/lib/opportunities/queries';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function OpportunityDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const opp = await getOpportunityBySlug(params.slug);

  if (!opp) {
    notFound();
  }

  const deadlineFormatted = opp.deadline
    ? new Date(opp.deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Open Rolling';

  const startFormatted = opp.start_date
    ? new Date(opp.start_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const endFormatted = opp.end_date
    ? new Date(opp.end_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const statusVariant =
    opp.status === 'OPEN'
      ? 'live'
      : opp.status === 'CLOSING_SOON'
      ? 'accent'
      : 'default';

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-28)' }}>
      <Container size="narrow">
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-10)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/opportunities" className="technical-label" style={{ color: 'var(--text-muted)' }}>
              OPPORTUNITIES
            </Link>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">{opp.type}</span>
          </div>

          <Link href="/opportunities" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            ← All Opportunities
          </Link>
        </div>

        {/* Opportunity Header */}
        <div style={{ marginBottom: 'var(--space-16)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Badge variant={statusVariant} useBrackets>
              {opp.status.replace('_', ' ')}
            </Badge>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {opp.organization}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginBottom: 'var(--space-4)',
            }}
          >
            {opp.title}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              fontStyle: 'italic',
            }}
          >
            &ldquo;{opp.short_description}&rdquo;
          </p>

          {/* Primary Action Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
            {opp.application_url && opp.status !== 'CLOSED' && (
              <Button href={opp.application_url} target="_blank" rel="noopener noreferrer" variant="primary" size="lg" showArrow>
                APPLY NOW ↗
              </Button>
            )}

            <Button href="/dashboard/opportunities" variant="outline" size="lg">
              Manage in Tracker
            </Button>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-12)' }}>
          {/* 01 // ABOUT */}
          <div>
            <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-4)' }}>
              01 // ABOUT THIS INITIATIVE
            </span>
            <div style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {opp.description}
            </div>
          </div>

          {/* 02 // KEY DATES & TIMELINE */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
            }}
          >
            <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-6)' }}>
              02 // KEY DATES & SCHEDULE
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  APPLICATION DEADLINE:
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: opp.status === 'CLOSING_SOON' ? 'var(--color-danger)' : 'var(--text-primary)', marginTop: '4px' }}>
                  {deadlineFormatted}
                </p>
              </div>

              {startFormatted && (
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    PROGRAM START:
                  </span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {startFormatted}
                  </p>
                </div>
              )}

              {endFormatted && (
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    PROGRAM END:
                  </span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>
                    {endFormatted}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 03 // LOCATION & FORMAT */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
            }}
          >
            <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
              03 // LOCATION & PARTICIPATION FORMAT
            </span>

            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              {opp.is_remote
                ? '🌐 Fully Remote. Open to participants globally.'
                : `📍 In Person / Physical attendance required at: ${opp.location || 'See organization website'}.`}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
