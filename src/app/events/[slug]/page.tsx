import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEventBySlug } from '@/lib/events/queries';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const startDate = new Date(event.start_at);
  const dateFormatted = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const startTimeFormatted = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const endTimeFormatted = event.end_at
    ? new Date(event.end_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : null;

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-28)' }}>
      <Container size="narrow">
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-10)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/events" className="technical-label" style={{ color: 'var(--text-muted)' }}>
              EVENTS
            </Link>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">{event.event_type}</span>
          </div>

          <Link href="/events" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            ← All Events
          </Link>
        </div>

        {/* Event Header */}
        <div style={{ marginBottom: 'var(--space-16)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Badge variant="accent" useBrackets>
              {event.event_type.replace('_', ' ')}
            </Badge>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ORGANIZED BY: {event.organizer}
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
            {event.title}
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
            &ldquo;{event.short_description}&rdquo;
          </p>

          {/* Action Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
            {event.registration_url && (
              <Button href={event.registration_url} target="_blank" rel="noopener noreferrer" variant="primary" size="lg" showArrow>
                REGISTER FOR SESSION ↗
              </Button>
            )}

            <Button href="/dashboard/events" variant="outline" size="lg">
              Manage RSVP
            </Button>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-12)' }}>
          {/* 01 // ABOUT */}
          <div>
            <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-4)' }}>
              01 // ABOUT THE GATHERING
            </span>
            <div style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {event.description}
            </div>
          </div>

          {/* 02 // SCHEDULE & TIMING */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
            }}
          >
            <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-6)' }}>
              02 // SCHEDULE & TIMEZONE
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  DATE:
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {dateFormatted}
                </p>
              </div>

              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  TIME:
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-primary-hover)', marginTop: '4px' }}>
                  {startTimeFormatted} {endTimeFormatted ? `– ${endTimeFormatted}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* 03 // VENUE */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
            }}
          >
            <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
              03 // VENUE & COORDINATES
            </span>

            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              {event.is_remote
                ? '🌐 Remote Livestream & Shared Terminal Session. Connection links provided upon registration.'
                : `📍 Physical Gathering: ${event.location || 'See event registration page'}.`}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
