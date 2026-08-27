import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { Event } from '@/lib/supabase/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function AdminEventsPage() {
  await requireAdmin();
  const supabase = createClient();

  let events: Event[] = [];
  try {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('start_at', { ascending: true });

    if (data) {
      events = data as Event[];
    }
  } catch {
    events = [];
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
            EVENT CALENDAR MATRIX // 2026
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginTop: 'var(--space-2)',
            }}
          >
            Manage Events
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Schedule demo days, workshops, salons, meetups, and hackathons.
          </p>
        </div>

        <Button href="/admin/events/new" variant="primary" size="sm" showArrow>
          + Create Event
        </Button>
      </div>

      {/* List */}
      {events.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-16) var(--space-8)',
            textAlign: 'center',
          }}
        >
          <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
            NO UPCOMING EVENTS
          </span>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              marginTop: 'var(--space-2)',
            }}
          >
            Calendar is Clear.
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: 'var(--space-3) auto var(--space-6)' }}>
            Create one when there&apos;s something worth gathering for.
          </p>
          <Button href="/admin/events/new" variant="primary" size="md" showArrow>
            Create Event
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-6) 0',
                borderBottom: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {event.title}
                  </h3>
                  <Badge variant="accent" useBrackets>
                    {event.event_type}
                  </Badge>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: event.is_published ? 'var(--color-success)' : 'var(--text-dim)',
                    }}
                  >
                    [ {event.is_published ? 'PUBLISHED' : 'DRAFT'} ]
                  </span>
                </div>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  DATE: {new Date(event.start_at).toLocaleString()} // {event.is_remote ? '🌐 Virtual' : event.location || 'In-Person'} // ORGANIZER: {event.organizer}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Button href={`/events/${event.slug}`} variant="outline" size="sm" target="_blank">
                  View Public ↗
                </Button>
                <Button href={`/admin/events/${event.id}/edit`} variant="primary" size="sm">
                  Edit Event
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
