'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveCareerRoleAction, deleteCareerRoleAction } from '@/lib/admin/actions';
import { CareerRole, CareerRoleStatus, RoleDepartment } from '@/lib/supabase/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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

export function CareerRoleEditForm({ initialRole }: { initialRole: CareerRole }) {
  const router = useRouter();

  const [title, setTitle] = useState(initialRole.title);
  const [slug, setSlug] = useState(initialRole.slug);
  const [department, setDepartment] = useState<RoleDepartment>(initialRole.department);
  const [shortDescription, setShortDescription] = useState(initialRole.short_description);
  const [description, setDescription] = useState(initialRole.description);
  const [responsibilities, setResponsibilities] = useState(initialRole.responsibilities);
  const [requirements, setRequirements] = useState(initialRole.requirements);
  const [niceToHave, setNiceToHave] = useState(initialRole.nice_to_have || '');
  const [benefits, setBenefits] = useState(initialRole.benefits);
  const [location, setLocation] = useState(initialRole.location || '');
  const [isRemote, setIsRemote] = useState(initialRole.is_remote);
  const [commitment, setCommitment] = useState(initialRole.commitment);
  const [deadline, setDeadline] = useState(
    initialRole.deadline ? initialRole.deadline.split('T')[0] : ''
  );
  const [status, setStatus] = useState<CareerRoleStatus>(initialRole.status);
  const [isPublished, setIsPublished] = useState(initialRole.is_published);

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
      await saveCareerRoleAction({
        id: initialRole.id,
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

      setIsPublished(publishState);
      router.push('/admin/careers');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to update career role');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCareerRoleAction(initialRole.id, initialRole.title);
      router.push('/admin/careers');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to delete role');
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
              EDIT CAREER ROLE
            </span>
            <Badge variant={status === 'OPEN' ? 'live' : 'default'} useBrackets>
              {status}
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
            {initialRole.title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Button href={`/careers/${initialRole.slug}`} variant="outline" size="sm" target="_blank">
            Preview Public ↗
          </Button>
          <Link href="/admin/careers" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
            ← Back to Roles
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
            label="Role Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            required
          />

          <Input
            label="Unique URL Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={errors.slug}
            required
          />
        </div>

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
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
          />
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

        <div style={{ maxWidth: '340px' }}>
          <Input
            label="Application Deadline (Optional)"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <Textarea
          label="Short Editorial Summary"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          error={errors.shortDescription}
          required
        />

        <Textarea
          label="Full Role Overview"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />

        <Textarea
          label="Key Responsibilities"
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
          error={errors.responsibilities}
          required
        />

        <Textarea
          label="Qualifications & Requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          error={errors.requirements}
          required
        />

        <Textarea
          label="Nice to Have (Optional)"
          value={niceToHave}
          onChange={(e) => setNiceToHave(e.target.value)}
        />

        <Textarea
          label="What MADE Offers / Benefits"
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
          error={errors.benefits}
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
            Delete Role
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
              Delete Career Role?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 'var(--space-3) 0 var(--space-6)', lineHeight: 1.6 }}>
              Are you sure you want to permanently remove <strong>{initialRole.title}</strong>? This action cannot be undone. Consider switching status to ARCHIVED if you wish to preserve submitted applications.
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
