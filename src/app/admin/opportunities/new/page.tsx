'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveOpportunityAction } from '@/lib/admin/actions';
import { OpportunityStatus, OpportunityType } from '@/lib/supabase/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

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

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CreateOpportunityPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [organization, setOrganization] = useState('');
  const [type, setType] = useState<OpportunityType>('HACKATHON');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Remote');
  const [isRemote, setIsRemote] = useState(true);
  const [applicationUrl, setApplicationUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<OpportunityStatus>('OPEN');

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
    if (!organization.trim()) newErrors.organization = 'Organization is required';
    if (!shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!description.trim()) newErrors.description = 'Full description is required';

    if (applicationUrl.trim()) {
      if (!/^https?:\/\//i.test(applicationUrl.trim())) {
        newErrors.applicationUrl = 'Must be a valid URL starting with https:// or http://';
      }
    }

    if (coverImage.trim()) {
      if (!/^https?:\/\//i.test(coverImage.trim()) && !coverImage.startsWith('/')) {
        newErrors.coverImage = 'Must be a valid URL or path starting with /';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await saveOpportunityAction({
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

      router.push('/admin/opportunities');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to save opportunity');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
            OPPORTUNITY AUTHORING
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
            Create Opportunity
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Define external hackathons, fellowships, grants, or builder tracks.
          </p>
        </div>

        <Link href="/admin/opportunities" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
          ← Back to Opportunities
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

      {/* Form Card */}
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
            placeholder="e.g. ETHGlobal San Francisco 2026"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={errors.title}
            required
          />

          <Input
            label="Unique Slug"
            placeholder="ethglobal-sf-2026"
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
            label="Hosting Organization"
            placeholder="e.g. ETHGlobal / Kleiner Perkins"
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
            placeholder="e.g. San Francisco, CA or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <input
              type="checkbox"
              id="remote-opp-check"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="remote-opp-check" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Remote / Online Participation Available
            </label>
          </div>
        </div>

        <Input
          label="External Application / Info URL"
          placeholder="https://ethglobal.com/events/sanfrancisco2026"
          value={applicationUrl}
          onChange={(e) => setApplicationUrl(e.target.value)}
          error={errors.applicationUrl}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
          <Input
            label="Application Deadline (Optional)"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <Input
            label="Start Date (Optional)"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="End Date (Optional)"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Input
          label="Cover Image URL (Optional)"
          placeholder="https://... or /images/..."
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          error={errors.coverImage}
        />

        <Textarea
          label="Short Summary (1-2 sentences)"
          placeholder="Concise overview of the opportunity."
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          error={errors.shortDescription}
          required
        />

        <Textarea
          label="Full Opportunity Narrative"
          placeholder="Detailed breakdown of rules, prizes, eligibility, mentorship, and schedule."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />

        {/* Action Controls */}
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
            {isSubmitting ? 'Publishing...' : 'Publish Opportunity'}
          </Button>
        </div>
      </div>
    </div>
  );
}
