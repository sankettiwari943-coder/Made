'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveOpportunityAction, deleteOpportunityAction } from '@/lib/admin/actions';
import { Opportunity, OpportunityStatus, OpportunityType } from '@/lib/supabase/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const TYPES: { label: string; value: OpportunityType }[] = [
  { label: 'Hackathon', value: 'HACKATHON' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Fellowship', value: 'FELLOWSHIP' },
  { label: 'Competition', value: 'COMPETITION' },
  { label: 'Grant', value: 'GRANT' },
  { label: 'Scholarship', value: 'SCHOLARSHIP' },
  { label: 'Program / Accelerator', value: 'PROGRAM' },
  { label: 'Other', value: 'OTHER' },
];

export function OpportunityEditForm({ initialOpp }: { initialOpp: Opportunity }) {
  const router = useRouter();

  const [title, setTitle] = useState(initialOpp.title);
  const [slug, setSlug] = useState(initialOpp.slug);
  const [organization, setOrganization] = useState(initialOpp.organization);
  const [type, setType] = useState<OpportunityType>(initialOpp.type);
  const [shortDescription, setShortDescription] = useState(initialOpp.short_description);
  const [description, setDescription] = useState(initialOpp.description);
  const [location, setLocation] = useState(initialOpp.location || '');
  const [isRemote, setIsRemote] = useState(initialOpp.is_remote);
  const [applicationUrl, setApplicationUrl] = useState(initialOpp.application_url || '');
  const [deadline, setDeadline] = useState(initialOpp.deadline ? initialOpp.deadline.split('T')[0] : '');
  const [startDate, setStartDate] = useState(initialOpp.start_date ? initialOpp.start_date.split('T')[0] : '');
  const [endDate, setEndDate] = useState(initialOpp.end_date ? initialOpp.end_date.split('T')[0] : '');
  const [coverImage, setCoverImage] = useState(initialOpp.cover_image || '');
  const [status, setStatus] = useState<OpportunityStatus>(initialOpp.status);
  const [isPublished, setIsPublished] = useState(initialOpp.is_published);

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
    if (!organization.trim()) newErrors.organization = 'Organization is required';
    if (!shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!description.trim()) newErrors.description = 'Full description is required';

    if (applicationUrl.trim()) {
      if (!/^https?:\/\//i.test(applicationUrl.trim())) {
        newErrors.applicationUrl = 'Must be a valid URL starting with https:// or http://';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await saveOpportunityAction({
        id: initialOpp.id,
        title,
        slug,
        organization,
        short_description: shortDescription,
        description,
        type,
        location,
        is_remote: isRemote,
        application_url: applicationUrl || null,
        deadline: deadline || null,
        start_date: startDate || null,
        end_date: endDate || null,
        cover_image: coverImage || null,
        status,
        is_published: publishState,
      });

      setIsPublished(publishState);
      router.push('/admin/opportunities');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to update opportunity');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteOpportunityAction(initialOpp.id, initialOpp.title);
      router.push('/admin/opportunities');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to delete opportunity');
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
              EDIT OPPORTUNITY
            </span>
            <Badge variant="accent" useBrackets>
              {type}
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
            {initialOpp.title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Button href={`/opportunities/${initialOpp.slug}`} variant="outline" size="sm" target="_blank">
            Preview Public ↗
          </Button>
          <Link href="/admin/opportunities" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
            ← Back to List
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

      {/* Form Grid */}
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
            label="Opportunity Title"
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
            label="Hosting Organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            error={errors.organization}
            required
          />

          <div>
            <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              OPPORTUNITY TYPE
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OpportunityType)}
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
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              STATUS
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
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
              <option value="OPEN">OPEN</option>
              <option value="CLOSING_SOON">CLOSING SOON</option>
              <option value="CLOSED">CLOSED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)', alignItems: 'center' }}>
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <input
              type="checkbox"
              id="remote-edit-check"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="remote-edit-check" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Remote / Online Participation Available
            </label>
          </div>
        </div>

        <Input
          label="External Application / Info URL"
          value={applicationUrl}
          onChange={(e) => setApplicationUrl(e.target.value)}
          error={errors.applicationUrl}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
          <Input
            label="Application Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Input
          label="Cover Image URL"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          error={errors.coverImage}
        />

        <Textarea
          label="Short Summary"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          error={errors.shortDescription}
          required
        />

        <Textarea
          label="Full Opportunity Narrative"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <Button
            type="button"
            variant="outline"
            size="md"
            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Opportunity
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

      {/* Delete Confirmation Modal */}
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
              Delete Opportunity?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 'var(--space-3) 0 var(--space-6)', lineHeight: 1.6 }}>
              Are you sure you want to permanently delete <strong>{initialOpp.title}</strong>? This action cannot be undone.
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
