import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCareerRoleBySlug, hasUserAppliedForRole } from '@/lib/careers/queries';
import { formatApplicationStatus } from '@/lib/careers/validations';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function CareerRoleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const role = await getCareerRoleBySlug(params.slug);

  if (!role) {
    notFound();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingApp = null;
  if (user && role) {
    const result = await hasUserAppliedForRole(user.id, role.id, user.email);
    if (result.applied && result.application) {
      existingApp = result.application;
    }
  }

  const deadlineFormatted = role.deadline
    ? new Date(role.deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Rolling Applications';

  const statusLabel = existingApp ? formatApplicationStatus(existingApp.status) : null;

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-28)' }}>
      <Container size="narrow">
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-10)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/careers" className="technical-label" style={{ color: 'var(--text-muted)' }}>
              CAREERS
            </Link>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">{role.department.replace('_', ' ')}</span>
          </div>

          <Link href="/careers" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            ← All Open Roles
          </Link>
        </div>

        {/* Existing Application Banner */}
        {existingApp && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--accent-primary)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-4) var(--space-6)',
              marginBottom: 'var(--space-8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
                [ APPLICATION ON FILE ]
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                You have already submitted an application for this role. Status:{' '}
                <strong style={{ color: 'var(--accent-primary-hover)' }}>
                  [{statusLabel}]
                </strong>
              </span>
            </div>

            <Button href={`/dashboard/applications/${existingApp.id}`} variant="outline" size="sm">
              View Submission Status →
            </Button>
          </div>
        )}

        {/* Role Header */}
        <div style={{ marginBottom: 'var(--space-16)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Badge variant="live" useBrackets>
              {role.status}
            </Badge>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {role.department.replace('_', ' ')} // {role.is_remote ? '🌐 REMOTE' : role.location}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginBottom: 'var(--space-4)',
            }}
          >
            {role.title}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              fontStyle: 'italic',
            }}
          >
            &ldquo;{role.short_description}&rdquo;
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
            {role.status === 'OPEN' ? (
              existingApp ? (
                <Button href={`/dashboard/applications/${existingApp.id}`} variant="outline" size="lg" showArrow>
                  VIEW SUBMISSION STATUS
                </Button>
              ) : (
                <Button href={`/careers/${role.slug}/apply`} variant="primary" size="lg" showArrow>
                  APPLY FOR THIS ROLE
                </Button>
              )
            ) : (
              <Badge variant="default" useBrackets>
                APPLICATIONS CLOSED
              </Badge>
            )}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-12)' }}>
          {/* 01 // ABOUT THE ROLE */}
          <div>
            <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-4)' }}>
              01 // ABOUT THE ROLE
            </span>
            <div style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {role.description}
            </div>
          </div>

          {/* 02 // WHAT YOU'LL BUILD */}
          <div>
            <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-4)' }}>
              02 // WHAT YOU WILL BUILD & SHIP
            </span>
            <div style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {role.responsibilities}
            </div>
          </div>

          {/* 03 // WHAT WE'RE LOOKING FOR */}
          <div>
            <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-4)' }}>
              03 // WHAT WE ARE LOOKING FOR
            </span>
            <div style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {role.requirements}
            </div>
          </div>

          {/* 04 // NICE TO HAVE */}
          {role.nice_to_have && (
            <div>
              <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-4)' }}>
                04 // NICE TO HAVE (NOT REQUIRED)
              </span>
              <div style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                {role.nice_to_have}
              </div>
            </div>
          )}

          {/* 05 // WHAT YOU'LL GET */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
            }}
          >
            <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
              05 // WHAT YOU RECEIVE AS A BUILDER
            </span>
            <div style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {role.benefits}
            </div>
          </div>

          {/* 06 // COMMITMENT & DEADLINE */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                TIME COMMITMENT:
              </span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {role.commitment}
              </p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                APPLICATION DEADLINE:
              </span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary-hover)', marginTop: '4px' }}>
                {deadlineFormatted}
              </p>
            </div>
          </div>

          {/* Bottom Application Action */}
          {role.status === 'OPEN' && (
            <div style={{ marginTop: 'var(--space-4)', textAlign: 'center', padding: 'var(--space-8) 0', borderTop: '1px solid var(--border-subtle)' }}>
              {existingApp ? (
                <Button href={`/dashboard/applications/${existingApp.id}`} variant="outline" size="lg" showArrow>
                  VIEW SUBMISSION STATUS (#{existingApp.reference_code})
                </Button>
              ) : (
                <Button href={`/careers/${role.slug}/apply`} variant="primary" size="lg" showArrow>
                  SUBMIT APPLICATION FOR {role.title.toUpperCase()}
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

