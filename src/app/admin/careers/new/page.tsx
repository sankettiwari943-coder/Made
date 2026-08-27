'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveCareerRoleAction } from '@/lib/admin/actions';
import { CareerRoleStatus, RoleDepartment } from '@/lib/supabase/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

const DEPARTMENTS: { label: string; value: RoleDepartment }[] = [
  { label: 'Engineering', value: 'ENGINEERING' },
  { label: 'AI / ML', value: 'AI_ML' },
  { label: 'Design', value: 'DESIGN' },
  { label: 'Cybersecurity', value: 'CYBERSECURITY' },
  { label: 'Community', value: 'COMMUNITY' },
  { label: 'Operations', value: 'OPERATIONS' },
  { label: 'Research', value: 'RESEARCH' },
  { label: 'Content', value: 'CONTENT' },
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CreateCareerRolePage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [department, setDepartment] = useState<RoleDepartment>('ENGINEERING');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [niceToHave, setNiceToHave] = useState('');
  const [benefits, setBenefits] = useState('');
  const [location, setLocation] = useState('Remote / Global');
  const [isRemote, setIsRemote] = useState(true);
  const [commitment, setCommitment] = useState('10-15 hrs/week');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<CareerRoleStatus>('OPEN');
  const [isPublished, setIsPublished] = useState(true);

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
    if (!shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!description.trim()) newErrors.description = 'Full description is required';
    if (!responsibilities.trim()) newErrors.responsibilities = 'Responsibilities are required';
    if (!requirements.trim()) newErrors.requirements = 'Requirements are required';
    if (!benefits.trim()) newErrors.benefits = 'Benefits are required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await saveCareerRoleAction({
        title,
        slug,
        department,
        short_description: shortDescription,
        description,
        responsibilities,
        requirements,
        nice_to_have: niceToHave || null,
        benefits,
        location,
        is_remote: isRemote,
        commitment,
        deadline: deadline || null,
        status,
        is_published: publishState,
      });

      if (!res.success) {
        if (res.fieldErrors) {
          const mappedErrors: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(res.fieldErrors)) {
            if (msgs && msgs[0]) {
              mappedErrors[key] = msgs[0];
            }
          }
          setErrors(mappedErrors);
        }
        setGeneralError(res.error || 'Failed to save career role');
        setIsSubmitting(false);
        return;
      }

      router.push('/admin/careers');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to save career role');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
            CAREER AUTHORING MATRIX
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
            Create New Role
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Define role parameters, candidate requirements, and publish to the MADE careers directory.
          </p>
        </div>

        <Link href="/admin/careers" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
          ← Back to Roles
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
        {/* Title & Slug */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          <Input
            label="Role Title"
            placeholder="e.g. Distributed Systems Engineer"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={errors.title}
            required
          />

          <Input
            label="Unique URL Slug"
            placeholder="distributed-systems-engineer"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEditedManually(true);
            }}
            error={errors.slug}
            required
          />
        </div>

        {/* Department, Status, Commitment */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
          <div>
            <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              DEPARTMENT
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as RoleDepartment)}
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
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
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
              onChange={(e) => setStatus(e.target.value as CareerRoleStatus)}
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
              <option value="OPEN">OPEN (Accepting Applications)</option>
              <option value="PAUSED">PAUSED (Temporarily Closed)</option>
              <option value="CLOSED">CLOSED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <Input
            label="Time Commitment"
            placeholder="e.g. 10-15 hrs/week"
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
          />
        </div>

        {/* Location & Remote */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)', alignItems: 'center' }}>
          <Input
            label="Location Description"
            placeholder="e.g. Remote / Global / San Francisco"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <input
              type="checkbox"
              id="remote-check"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="remote-check" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Position is 100% Remote-Friendly
            </label>
          </div>
        </div>

        {/* Deadline */}
        <div style={{ maxWidth: '340px' }}>
          <Input
            label="Application Deadline (Optional)"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        {/* Short Description */}
        <Textarea
          label="Short Editorial Summary (1-2 sentences)"
          placeholder="Briefly describe what this builder will work on and why it matters."
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          error={errors.shortDescription}
          required
        />

        {/* Full Overview Description */}
        <Textarea
          label="Full Role Overview"
          placeholder="Detailed narrative about the initiative, project scope, architecture, and team dynamic."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />

        {/* Responsibilities */}
        <Textarea
          label="Key Responsibilities"
          placeholder="• Architect and maintain high-throughput backend services&#10;• Collaborate with frontend leads to design schemas&#10;• Review fellow builder pull requests"
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
          error={errors.responsibilities}
          required
        />

        {/* Requirements */}
        <Textarea
          label="Qualifications & Requirements"
          placeholder="• Strong foundation in TypeScript & React&#10;• Relentless focus on craft and typography&#10;• Demonstrated builds or repositories"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          error={errors.requirements}
          required
        />

        {/* Nice to have */}
        <Textarea
          label="Nice to Have (Optional)"
          placeholder="• Prior experience with WebRTC or distributed databases&#10;• Active open source contributor"
          value={niceToHave}
          onChange={(e) => setNiceToHave(e.target.value)}
        />

        {/* Benefits & Growth */}
        <Textarea
          label="What MADE Offers / Benefits"
          placeholder="• Complete ownership of technical components&#10;• Mentorship from experienced founders&#10;• Direct collaboration with top student engineers"
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
          error={errors.benefits}
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
            {isSubmitting ? 'Publishing...' : 'Publish Role'}
          </Button>
        </div>
      </div>
    </div>
  );
}
