'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CareerApplication, ApplicationStatus } from '@/lib/supabase/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All Applications', value: 'ALL' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Shortlisted', value: 'SHORTLISTED' },
  { label: 'Interview', value: 'INTERVIEW' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Withdrawn', value: 'WITHDRAWN' },
];

export function AdminApplicationsClient({
  initialApplications,
  initialFilterStatus = 'ALL',
}: {
  initialApplications: CareerApplication[];
  initialFilterStatus?: string;
}) {
  const [applications] = useState<CareerApplication[]>(initialApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialFilterStatus);

  const getApplicantName = (app: CareerApplication) => {
    return (
      (app.full_name && app.full_name !== app.email ? app.full_name : null) ||
      (app.name && app.name !== app.email ? app.name : null) ||
      (app.applicant_name && app.applicant_name !== app.email ? app.applicant_name : null) ||
      (app.profiles?.full_name && app.profiles.full_name !== app.email ? app.profiles.full_name : null) ||
      (app.profiles?.name && app.profiles.name !== app.email ? app.profiles.name : null) ||
      (app.applicant?.full_name && app.applicant.full_name !== app.email ? app.applicant.full_name : null) ||
      (app.applicant?.name && app.applicant.name !== app.email ? app.applicant.name : null) ||
      'Anonymous Applicant'
    );
  };

  const getApplicantEmail = (app: CareerApplication) => {
    return (
      app.email ||
      app.applicant_email ||
      app.user_email ||
      app.contact_email ||
      app.profiles?.email ||
      app.applicant?.email ||
      app.auth_user?.email ||
      ''
    );
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;

    const query = searchTerm.toLowerCase().trim();
    const appName = getApplicantName(app).toLowerCase();
    const appEmail = getApplicantEmail(app).toLowerCase();
    const matchesSearch =
      query === '' ||
      (app.reference_code && app.reference_code.toLowerCase().includes(query)) ||
      appName.includes(query) ||
      appEmail.includes(query) ||
      (app.applicant?.username && app.applicant.username.toLowerCase().includes(query)) ||
      (app.profiles?.username && app.profiles.username.toLowerCase().includes(query)) ||
      (app.role?.title && app.role.title.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)' }}>
        <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
          CANDIDATE DOSSIER QUEUE
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
          Career Applications
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Review submissions, evaluate builder portfolios, inspect private resumes, and manage review stages.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          alignItems: 'end',
        }}
      >
        <Input
          label="Search Submissions"
          placeholder="Filter by applicant, reference, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div>
          <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
            STATUS FILTER
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
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
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
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
            NO APPLICATIONS YET
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
            Zero Submissions.
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: 'var(--space-3) auto var(--space-6)' }}>
            When someone applies to a MADE role, their application will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
          {filteredApplications.map((app) => (
            <div
              key={app.id}
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
                    {getApplicantName(app)}
                  </h3>
                  <Badge variant={app.status === 'ACCEPTED' ? 'live' : app.status === 'SHORTLISTED' || app.status === 'INTERVIEW' ? 'accent' : 'default'} useBrackets>
                    {app.status}
                  </Badge>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    REF: {app.reference_code}
                  </span>
                </div>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  ROLE: {app.role?.title || 'General Application'} // HANDLE: {(app.applicant?.username || app.profiles?.username) ? `@${app.applicant?.username || app.profiles?.username}` : 'None'} // SUBMITTED: {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Button href={`/admin/applications/${app.id}`} variant="primary" size="sm" showArrow>
                  Review Dossier
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
