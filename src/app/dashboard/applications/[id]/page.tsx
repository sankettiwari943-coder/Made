'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { CareerApplication } from '@/lib/supabase/types';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

const STAGES = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'DECISION'];

export default function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const applicationId = params.id;
  const { isConfigured } = getSupabaseEnv();

  const [application, setApplication] = useState<CareerApplication | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const loadApp = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?next=/dashboard/applications/${applicationId}`);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('career_applications')
        .select('*, role:career_roles(*)')
        .eq('id', applicationId)
        .eq('applicant_id', user.id)
        .single();

      if (!error && data) {
        setApplication(data as any);
      }

      setIsLoading(false);
    };

    loadApp();
  }, [isConfigured, applicationId, router]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="technical-label">FETCHING APPLICATION DOSSIER...</span>
      </div>
    );
  }

  if (!application) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center' }}>
        <Container size="narrow">
          <span className="technical-label" style={{ color: 'var(--color-danger)' }}>
            [ DOSSIER NOT FOUND ]
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginTop: 'var(--space-2)' }}>
            Application Inaccessible
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            This application record does not exist or you do not have permission to view it.
          </p>
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Button href="/dashboard/applications" variant="primary" size="sm">
              ← Return to Applications
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const handleWithdraw = async () => {
    if (!userId || application.status === 'WITHDRAWN') return;
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;

    setIsWithdrawing(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('career_applications')
      .update({ status: 'WITHDRAWN', updated_at: new Date().toISOString() })
      .eq('id', application.id)
      .eq('applicant_id', userId);

    if (!error) {
      setApplication({ ...application, status: 'WITHDRAWN' });
    }
    setIsWithdrawing(false);
  };

  const getStageIndex = (status: string) => {
    if (status === 'SUBMITTED') return 0;
    if (status === 'UNDER_REVIEW') return 1;
    if (status === 'SHORTLISTED') return 2;
    if (status === 'INTERVIEW') return 3;
    if (status === 'ACCEPTED' || status === 'REJECTED') return 4;
    return 0;
  };

  const currentStageIndex = getStageIndex(application.status);

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-28)' }}>
      <Container size="narrow">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/dashboard/applications" className="technical-label" style={{ color: 'var(--text-muted)' }}>
              APPLICATIONS
            </Link>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">#{application.reference_code}</span>
          </div>

          <Link href="/dashboard/applications" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            ← All Applications
          </Link>
        </div>

        {/* Application Header Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
                POSITION APPLIED
              </span>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '2px' }}>
                {application.role?.title || 'Builder Role'}
              </h1>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                REFERENCE: #{application.reference_code} // SUBMITTED: {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>

            <Badge variant={application.status === 'ACCEPTED' ? 'live' : 'accent'} useBrackets>
              {application.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Status Progression Timeline */}
          {application.status !== 'WITHDRAWN' && (
            <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-subtle)' }}>
              <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
                APPLICATION PROGRESSION TIMELINE
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {STAGES.map((st, idx) => {
                  const isReached = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <React.Fragment key={st}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          padding: '3px 8px',
                          backgroundColor: isCurrent ? 'var(--text-primary)' : isReached ? 'var(--bg-canvas)' : 'transparent',
                          color: isCurrent ? 'var(--bg-canvas)' : isReached ? 'var(--text-primary)' : 'var(--text-dim)',
                          border: isReached ? '1px solid var(--border-technical)' : '1px solid transparent',
                          borderRadius: 'var(--radius-xs)',
                          fontWeight: isCurrent ? 700 : 400,
                        }}
                      >
                        [{st.replace('_', ' ')}]
                      </span>
                      {idx < STAGES.length - 1 && (
                        <span style={{ color: 'var(--border-technical)', fontSize: '0.6875rem' }}>→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submitted Information Dossier */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-8)',
          }}
        >
          <div>
            <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              01 // WHAT YOU BUILD
            </span>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {application.what_they_build}
            </p>
          </div>

          <div>
            <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              02 // BACKGROUND & EXPERIENCE
            </span>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {application.experience}
            </p>
          </div>

          <div>
            <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              03 // WHY MADE
            </span>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {application.cover_message}
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', borderTop: '1px solid var(--border-technical)', paddingTop: 'var(--space-4)' }}>
            {application.github_url && (
              <a href={application.github_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
                GitHub ↗
              </a>
            )}
            {application.linkedin_url && (
              <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
                LinkedIn ↗
              </a>
            )}
            {application.portfolio_url && (
              <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
                Portfolio ↗
              </a>
            )}
          </div>

          {/* Withdrawal option */}
          {application.status !== 'WITHDRAWN' && application.status !== 'ACCEPTED' && application.status !== 'REJECTED' && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
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
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw Application'}
              </button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
