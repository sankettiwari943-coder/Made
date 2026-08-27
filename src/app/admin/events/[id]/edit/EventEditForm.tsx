'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveEventAction, deleteEventAction } from '@/lib/admin/actions';
import { Event, EventType } from '@/lib/supabase/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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

function formatForDateTimeLocal(isoString: string | null): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  const offset = d.getTimezoneOffset() * 60000;
  const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
  return localISOTime;
}

export function EventEditForm({ initialEvent }: { initialEvent: Event }) {
  const router = useRouter();

  const [title, setTitle] = useState(initialEvent.title);
  const [slug, setSlug] = useState(initialEvent.slug);
  const [organizer, setOrganizer] = useState(initialEvent.organizer);
  const [eventType, setEventType] = useState<EventType>(initialEvent.event_type);
  const [shortDescription, setShortDescription] = useState(initialEvent.short_description);
  const [description, setDescription] = useState(initialEvent.description);
  const [location, setLocation] = useState(initialEvent.location || '');
  const [isRemote, setIsRemote] = useState(initialEvent.is_remote);
  const [startAt, setStartAt] = useState(formatForDateTimeLocal(initialEvent.start_at));
  const [endAt, setEndAt] = useState(formatForDateTimeLocal(initialEvent.end_at));
  const [registrationUrl, setRegistrationUrl] = useState(initialEvent.registration_url || '');
  const [coverImage, setCoverImage] = useState(initialEvent.cover_image || '');
  const [isPublished, setIsPublished] = useState(initialEvent.is_published);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        id: initialEvent.id,
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

      setIsPublished(publishState);
      router.push('/admin/events');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to update event');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEventAction(initialEvent.id, initialEvent.title);
      router.push('/admin/events');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to delete event');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div>
      {/* Masthead */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
              EDIT EVENT
            </span>
            <Badge variant="accent" useBrackets>
              {eventType}
            </Badge>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700, color: isPublished ? 'var(--color-success)' : 'var(--text-dim)' }}>
              [ {isPublished ? 'PUBLISHED' : 'DRAFT'} ]
            </span>
          </div>
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
            {initialEvent.title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Button href={`/events/${initialEvent.slug}`} variant="outline" size="sm" target="_blank">
            Preview Public ↗
          </Button>
          <Link href="/admin/events" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
            ← Back to Events
          </Link>
        </div>
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            required
          />

          <Input
            label="Unique Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={errors.slug}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
          <Input
            label="Organizer / Host"
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
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <input
              type="checkbox"
              id="remote-edit-event-check"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="remote-edit-event-check" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Virtual / Live Streaming Available
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          <Input
            label="Start Date & Time"
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
          label="Registration / RSVP URL"
          value={registrationUrl}
          onChange={(e) => setRegistrationUrl(e.target.value)}
          error={errors.registrationUrl}
        />

        <Input
          label="Cover Image URL"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
        />

        <Textarea
          label="Short Summary"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          error={errors.shortDescription}
          required
        />

        <Textarea
          label="Full Event Agenda & Details"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <Button
            type="button"
            variant="outline"
            size="md"
            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Event
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
              {isSubmitting ? 'Updating...' : 'Publish Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 'var(--space-4)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
              maxWidth: '480px',
              width: '100%',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--color-danger)' }}>
              CRITICAL CONFIRMATION
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', marginTop: 'var(--space-2)' }}>
              Delete Event?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 'var(--space-3) 0 var(--space-6)', lineHeight: 1.6 }}>
              Are you sure you want to permanently remove <strong>{initialEvent.title}</strong>? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)', color: '#fff' }}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
