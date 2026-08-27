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

export default function DashboardApplicationsPage() {
  const router = useRouter();
  const { isConfigured } = getSupabaseEnv();

  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const loadApps = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?next=/dashboard/applications');
        return;
      }

      const { data, error } = await supabase
        .from('career_applications')
        .select('id, reference_code, role_id, applicant_id, status, created_at, updated_at, role:career_roles(*)')
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setApplications(data as any[]);
      } else {
        setApplications([]);
      }

      setIsLoading(false);
    };

    loadApps();
  }, [isConfigured, router]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="technical-label">LOADING APPLICATION DOSSIER...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-28)' }}>
      <Container>
        {/* Top Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-8)',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 'var(--space-4)',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              WORKSPACE
            </span>
            <span style={{ color: 'var(--border-regular)' }}>|</span>
            <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Overview
            </Link>
            <Link href="/dashboard/projects" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Projects
            </Link>
            <Link href="/dashboard/opportunities" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Opportunities
            </Link>
            <Link href="/dashboard/events" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Events
            </Link>
            <Link href="/dashboard/applications" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary-hover)', textDecoration: 'underline' }}>
              Applications
            </Link>
          </div>

          <Button href="/careers" variant="primary" size="sm" showArrow>
            Explore Open Roles
          </Button>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
            CAREER & INITIATIVE TRACKING
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginTop: 'var(--space-2)',
            }}
          >
            Your Applications
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Track the status of your applications to build with the MADE collective.
          </p>
        </div>

        {/* Applications List / Empty State */}
        {applications.length === 0 ? (
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
              APPLICATIONS
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
              Nothing Here Yet.
            </h3>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                maxWidth: '440px',
                margin: 'var(--space-3) auto var(--space-6)',
                lineHeight: 1.6,
              }}
            >
              When you apply to a MADE role, your application will appear here.
            </p>
            <Button href="/careers" variant="primary" size="md" showArrow>
              VIEW OPEN ROLES
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
            {applications.map((app) => {
              const statusVariant =
                app.status === 'ACCEPTED'
                  ? 'live'
                  : app.status === 'SHORTLISTED' || app.status === 'INTERVIEW'
                  ? 'accent'
                  : app.status === 'UNDER_REVIEW'
                  ? 'building'
                  : 'default';

              return (
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
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                        {app.role?.title || 'Builder Role'}
                      </h3>
                      <Badge variant={statusVariant} useBrackets>
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                      REF: #{app.reference_code} // SUBMITTED: {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <Button href={`/dashboard/applications/${app.id}`} variant="outline" size="sm">
                    View Application →
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
