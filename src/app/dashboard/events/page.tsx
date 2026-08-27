'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { Event, EventRsvpStatus } from '@/lib/supabase/types';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

export default function DashboardEventsPage() {
  const router = useRouter();
  const { isConfigured } = getSupabaseEnv();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [userRsvps, setUserRsvps] = useState<Record<string, EventRsvpStatus>>({});

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const loadEvents = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?next=/dashboard/events');
        return;
      }

      setUserId(user.id);

      // 1. Fetch published events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('start_at', { ascending: true });

      if (eventsData && eventsData.length > 0) {
        setEvents(eventsData as Event[]);
      } else {
        setEvents([]);
      }

      // 2. Fetch user RSVPs
      const { data: rsvpData } = await supabase
        .from('event_rsvps')
        .select('event_id, status')
        .eq('user_id', user.id);

      if (rsvpData) {
        const map: Record<string, EventRsvpStatus> = {};
        rsvpData.forEach((r) => {
          map[r.event_id] = r.status;
        });
        setUserRsvps(map);
      } else {
        setUserRsvps({});
      }

      setIsLoading(false);
    };

    loadEvents();
  }, [isConfigured, router]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="technical-label">LOADING EVENTS CALENDAR...</span>
      </div>
    );
  }

  const handleUpdateRsvp = async (eventId: string, status: EventRsvpStatus) => {
    if (!userId) return;
    const supabase = createClient();

    const { error } = await supabase
      .from('event_rsvps')
      .upsert({
        user_id: userId,
        event_id: eventId,
        status: status,
        updated_at: new Date().toISOString(),
      });

    if (!error) {
      setUserRsvps((prev) => ({ ...prev, [eventId]: status }));
    }
  };

  const attendingEvents = events.filter((e) => userRsvps[e.id] === 'GOING');

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-28)' }}>
      <Container>
        {/* Workspace Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-8)',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 'var(--space-4)',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              WORKSPACE
            </span>
            <span style={{ color: 'var(--border-regular)' }}>|</span>
            <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Overview
            </Link>
            <Link href="/dashboard/projects" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Projects
            </Link>
            <Link href="/dashboard/opportunities" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Opportunities
            </Link>
            <Link href="/dashboard/events" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary-hover)', textDecoration: 'underline' }}>
              Events
            </Link>
            <Link href="/dashboard/applications" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Applications
            </Link>
          </div>

          <Button href="/events" variant="primary" size="sm" showArrow>
            View Public Calendar
          </Button>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
            GATHERINGS & ATTENDANCE MATRIX
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginTop: 'var(--space-2)',
            }}
          >
            My Event RSVPs
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Manage attendance for live build nights, compiler salons, and demo days.
          </p>
        </div>

        {/* Section 1: My Confirmed RSVPs */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-4)' }}>
            MY CONFIRMED ATTENDANCE ({attendingEvents.length})
          </span>

          {attendingEvents.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-technical)',
                borderRadius: 'var(--radius-xs)',
                padding: 'var(--space-12) var(--space-8)',
                textAlign: 'center',
              }}
            >
              <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
                MY EVENTS
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
                No Upcoming RSVPs.
              </h3>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '440px',
                  margin: 'var(--space-3) auto var(--space-6)',
                  lineHeight: 1.6,
                }}
              >
                Find something worth showing up for.
              </p>
              <Button href="/events" variant="primary" size="md" showArrow>
                EXPLORE EVENTS
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
              {attendingEvents.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-technical)',
                    borderRadius: 'var(--radius-xs)',
                    padding: 'var(--space-6)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <Badge variant="live" useBrackets>
                        ATTENDING
                      </Badge>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                        {new Date(ev.start_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', marginTop: 'var(--space-2)' }}>
                      <Link href={`/events/${ev.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {ev.title}
                      </Link>
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {ev.is_remote ? '🌐 Remote Session' : `📍 ${ev.location}`}
                    </p>
                  </div>

                  <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button href={`/events/${ev.slug}`} variant="outline" size="sm">
                      Event Details →
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleUpdateRsvp(ev.id, 'NOT_GOING')}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--color-danger)',
                        background: 'none',
                        border: 'none',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel RSVP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: All Upcoming Events Matrix */}
        {events.length > 0 && (
          <div>
            <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-4)' }}>
              AVAILABLE SCHEDULE & QUICK RSVP
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
              {events.map((ev) => {
                const currentStatus = userRsvps[ev.id] || 'NOT_GOING';
                return (
                  <div
                    key={ev.id}
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
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                          <Link href={`/events/${ev.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {ev.title}
                          </Link>
                        </h3>
                        <Badge variant={currentStatus === 'GOING' ? 'live' : 'default'} useBrackets>
                          {currentStatus}
                        </Badge>
                      </div>

                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                        DATE: {new Date(ev.start_at).toLocaleDateString()} // HOSTED BY: {ev.organizer} // {ev.is_remote ? '🌐 Remote' : ev.location}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {(['GOING', 'MAYBE', 'NOT_GOING'] as EventRsvpStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateRsvp(ev.id, st)}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.625rem',
                            padding: '4px 10px',
                            backgroundColor: currentStatus === st ? 'var(--text-primary)' : 'var(--bg-surface)',
                            color: currentStatus === st ? 'var(--bg-canvas)' : 'var(--text-muted)',
                            border: currentStatus === st ? '1px solid var(--text-primary)' : '1px solid var(--border-technical)',
                            borderRadius: 'var(--radius-xs)',
                            cursor: 'pointer',
                            fontWeight: currentStatus === st ? 700 : 400,
                          }}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
