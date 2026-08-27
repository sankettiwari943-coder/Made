'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { Event } from '@/lib/supabase/types';
import { EVENT_TYPES } from '@/lib/events/validations';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/editorial/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function EventsCalendarPage() {
  const { isConfigured } = getSupabaseEnv();

  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<'ALL' | 'REMOTE' | 'IN_PERSON'>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .order('start_at', { ascending: true });

        if (error || !data || data.length === 0) {
          setEvents([]);
          setIsLoading(false);
          return;
        }

        setEvents(data as Event[]);
      } catch {
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [isConfigured]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.short_description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === 'ALL' || event.event_type === selectedType;

      const matchesFormat =
        selectedFormat === 'ALL' ||
        (selectedFormat === 'REMOTE' && event.is_remote) ||
        (selectedFormat === 'IN_PERSON' && !event.is_remote);

      return matchesSearch && matchesType && matchesFormat;
    });
  }, [events, searchTerm, selectedType, selectedFormat]);

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-28)' }}>
      <Container>
        {/* Section Heading */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <SectionHeading
            index="CALENDAR"
            label="EVENTS / 2026"
            title="Where Builders Meet"
            description="Intensive weekend sprints, compiler salons, code reviews, and live demo days across the MADE network."
          />
        </div>

        {/* Filter Bar */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >
          <div style={{ maxWidth: '480px' }}>
            <Input
              type="search"
              placeholder="Search by event title, organizer, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              EVENT DISCIPLINE
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setSelectedType('ALL')}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  padding: '4px 10px',
                  backgroundColor: selectedType === 'ALL' ? 'var(--text-primary)' : 'var(--bg-canvas)',
                  color: selectedType === 'ALL' ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                  border: selectedType === 'ALL' ? '1px solid var(--text-primary)' : '1px solid var(--border-technical)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  fontWeight: selectedType === 'ALL' ? 700 : 500,
                }}
              >
                ALL EVENTS
              </button>
              {EVENT_TYPES.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      padding: '4px 10px',
                      backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-canvas)',
                      color: isSelected ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-technical)',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    {type.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Stream / Intentional Empty State */}
        {isLoading ? (
          <div style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
            <span className="technical-label">LOADING EVENT CALENDAR...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-16) var(--space-8)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              textAlign: 'center',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
              EVENTS / 2026
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.25rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                marginTop: 'var(--space-2)',
              }}
            >
              The Calendar is Quiet.
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                maxWidth: '480px',
                margin: 'var(--space-3) auto var(--space-8)',
                lineHeight: 1.6,
              }}
            >
              We&apos;re waiting for the next thing worth gathering for.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
              <Button href="/projects" variant="primary" size="lg" showArrow>
                EXPLORE MADE
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
            {filteredEvents.map((event) => {
              const startDate = new Date(event.start_at);
              const formattedDate = startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short',
              });

              return (
                <Link
                  key={event.slug}
                  href={`/events/${event.slug}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    padding: 'var(--space-6) 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    gap: 'var(--space-3)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {formattedDate} //
                      </span>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                        {event.title}
                      </h3>
                      <Badge variant="live" useBrackets>
                        {event.event_type.replace('_', ' ')}
                      </Badge>
                    </div>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {event.is_remote ? '🌐 REMOTE SESSION' : `📍 ${event.location}`}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '780px' }}>
                    {event.short_description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      TIME: {formattedTime} // HOSTED BY {event.organizer}
                    </span>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary-hover)' }}>
                      VIEW SCHEDULE & RSVP →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
