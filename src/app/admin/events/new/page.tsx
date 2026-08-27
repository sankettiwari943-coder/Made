'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveEventAction } from '@/lib/admin/actions';
import { EventType } from '@/lib/supabase/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

const EVENT_TYPES: { label: string; value: EventType }[] = [
  { label: 'Meetup', value: 'MEETUP' },
  { label: 'Workshop / Technical Deep Dive', value: 'WORKSHOP' },
  { label: 'Hackathon', value: 'HACKATHON' },
  { label: 'Demo Day', value: 'DEMO_DAY' },
  { label: 'Technical Talk / Salon', value: 'TALK' },
  { label: 'Conference', value: 'CONFERENCE' },
  { label: 'Community Gathering', value: 'COMMUNITY' },
  { label: 'Other', value: 'OTHER' },
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [organizer, setOrganizer] = useState('MADE Core Team');
  const [eventType, setEventType] = useState<EventType>('WORKSHOP');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('San Francisco, CA / Discord');
  const [isRemote, setIsRemote] = useState(true);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEditedManually) {
      setSlug(generateSlug(val));
    }
  };

  const handleSave = async (publishState: boolean) => {
    setErrors({});
    setGeneralError(null);

    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!slug.trim()) newErrors.slug = 'Slug is required';
    if (!organizer.trim()) newErrors.organizer = 'Organizer is required';
    if (!shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!description.trim()) newErrors.description = 'Full description is required';
    if (!startAt) newErrors.startAt = 'Start date and time are required';

    if (startAt && endAt) {
      const startTime = new Date(startAt).getTime();
      const endTime = new Date(endAt).getTime();
      if (endTime <= startTime) {
        newErrors.endAt = 'End time must be strictly after start time';
      }
    }

    if (registrationUrl.trim()) {
      if (!/^https?:\/\//i.test(registrationUrl.trim())) {
        newErrors.registrationUrl = 'Must be a valid URL starting with https:// or http://';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await saveEventAction({
        title,
        slug,
        organizer,
        short_description: shortDescription,
        description,
        event_type: eventType,
        location,
        is_remote: isRemote,
        start_at: startAt,
        end_at: endAt || null,
        registration_url: registrationUrl || null,
        cover_image: coverImage || null,
        is_published: publishState,
      });

      router.push('/admin/events');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to save event');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
            EVENT AUTHORING MATRIX
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
            Create New Event
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Schedule and publish live sessions, salons, or demo nights.
          </p>
        </div>

        <Link href="/admin/events" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
          ← Back to Events
        </Link>
      </div>

      {generalError && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: 'var(--color-danger)',
          }}
        >
          [ ERROR ]: {generalError}
        </div>
      )}

      {/* Form Container */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-technical)',
          borderRadius: 'var(--radius-xs)',
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          <Input
            label="Event Title"
            placeholder="e.g. MADE Build Night 01: Low-Level Systems"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={errors.title}
            required
          />

          <Input
            label="Unique Slug"
            placeholder="build-night-01"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEditedManually(true);
            }}
            error={errors.slug}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
          <Input
            label="Organizer / Host"
            placeholder="e.g. MADE Systems Lab"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            error={errors.organizer}
            required
          />

          <div>
            <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              EVENT TYPE
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-technical)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)', alignItems: 'center' }}>
          <Input
            label="Location Description"
            placeholder="e.g. San Francisco Lab or Discord Stage"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <input
              type="checkbox"
              id="remote-event-check"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="remote-event-check" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Virtual / Live Streaming Available
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          <Input
            label="Start Date & Time (Timezone-Aware)"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            error={errors.startAt}
            required
          />

          <Input
            label="End Date & Time (Optional)"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            error={errors.endAt}
          />
        </div>

        <Input
          label="Registration / RSVP URL (Optional)"
          placeholder="https://lu.ma/... or https://meet.google.com/..."
          value={registrationUrl}
          onChange={(e) => setRegistrationUrl(e.target.value)}
          error={errors.registrationUrl}
        />

        <Input
          label="Cover Image URL (Optional)"
          placeholder="https://... or /images/..."
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
        />

        <Textarea
          label="Short Summary (1-2 sentences)"
          placeholder="Brief description of the event topic and format."
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          error={errors.shortDescription}
          required
        />

        <Textarea
          label="Full Event Agenda & Details"
          placeholder="Detailed breakdown of speakers, timeline, prep work, and location instructions."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-6)' }}>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
          >
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            showArrow
          >
            {isSubmitting ? 'Publishing...' : 'Publish Event'}
          </Button>
        </div>
      </div>
    </div>
  );
}
