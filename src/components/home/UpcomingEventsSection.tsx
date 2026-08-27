import React from 'react';
import Link from 'next/link';
import { getUpcomingEvents } from '@/lib/events/queries';
import { Container } from '../layout/Container';
import { SectionHeading } from '../editorial/SectionHeading';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const UpcomingEventsSection: React.FC = async () => {
  const upcomingEvents = await getUpcomingEvents(3);

  return (
    <section style={{ padding: 'var(--space-20) 0', borderTop: '1px solid var(--border-subtle)' }}>
      <Container>
        <SectionHeading
          index="06 // CALENDAR"
          label="UPCOMING SESSIONS"
          title="Where Builders Meet"
          description="Live build nights, compiler salons, and demo days across the network."
          action={
            <Button href="/events" variant="outline" size="sm" showArrow>
              View All Events
            </Button>
          }
        />

        {upcomingEvents.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-12) var(--space-6)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              textAlign: 'center',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
              NO UPCOMING SESSIONS
            </span>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              The calendar is currently clear. Next schedule will be published shortly.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
            {upcomingEvents.map((ev, idx) => {
              const formattedIndex = String(idx + 1).padStart(2, '0');
              const startDate = new Date(ev.start_at);
              const dateFormatted = startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <Link
                  key={ev.slug}
                  href={`/events/${ev.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-6) 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    color: 'inherit',
                    flexWrap: 'wrap',
                    gap: 'var(--space-4)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {formattedIndex} /
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                        {dateFormatted}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                      {ev.title}
                    </h3>

                    <Badge variant="default" useBrackets>
                      {ev.is_remote ? 'REMOTE' : ev.location || 'IN PERSON'}
                    </Badge>
                  </div>

                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary-hover)' }}>
                    VIEW DETAILS →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
};
