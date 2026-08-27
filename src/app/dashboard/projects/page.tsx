import React from 'react';
import Link from 'next/link';
import { requireProfile } from '@/lib/auth/authorization';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { getUserProjects } from '@/lib/projects/queries';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SignOutButton } from '../SignOutButton';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

export default async function DashboardProjectsPage() {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  const profile = await requireProfile();
  const userProjects = await getUserProjects(profile.id);

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-28)' }}>
      <Container>
        {/* Top Breadcrumb & Actions */}
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
              WORKSPACE // {profile.username ? `@${profile.username}` : 'ACTIVE'}
            </span>
            <span style={{ color: 'var(--border-regular)' }}>|</span>
            <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Overview
            </Link>
            <Link href="/dashboard/projects" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary-hover)', textDecoration: 'underline' }}>
              Your Projects
            </Link>
            <Link href="/profile/edit" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Edit Profile
            </Link>
            <Link href="/settings" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Settings
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Button href="/dashboard/projects/new" variant="primary" size="sm" showArrow>
              + New Project
            </Button>
            <SignOutButton />
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
            REPOSITORY MANAGEMENT
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
            Your Builds & Systems
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Manage active projects, log milestone updates, and invite collaborators.
          </p>
        </div>

        {/* Projects List or Empty State */}
        {userProjects.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-16) var(--space-8)',
              textAlign: 'center',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
              NO BUILDS YET.
            </span>
            <blockquote
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                color: 'var(--text-primary)',
                fontStyle: 'italic',
                margin: 'var(--space-4) 0',
                lineHeight: 1.3,
              }}
            >
              &ldquo;Ideas are easy. Making them real is the point.&rdquo;
            </blockquote>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
              Deploy your first repository to the MADE network and begin documenting build logs.
            </p>

            <Button href="/dashboard/projects/new" variant="primary" size="md" showArrow>
              START A PROJECT
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
            {userProjects.map((project, idx) => {
              const formattedIndex = String(idx + 1).padStart(2, '0');
              const isOwner = project.owner_id === profile.id;
              const statusVariant =
                project.status === 'LIVE'
                  ? 'live'
                  : project.status === 'BUILDING'
                  ? 'building'
                  : project.status === 'OPEN_SOURCE'
                  ? 'opensource'
                  : project.status === 'PROTOTYPE'
                  ? 'prototype'
                  : 'idea';

              return (
                <div
                  key={project.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    padding: 'var(--space-8) 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    gap: 'var(--space-4)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {formattedIndex} //
                      </span>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                        {project.title}
                      </h3>
                      <Badge variant={statusVariant} useBrackets>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: isOwner ? 'var(--accent-primary-hover)' : 'var(--text-muted)' }}>
                        [ {isOwner ? 'OWNER' : 'COLLABORATOR'} ]
                      </span>
                    </div>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      {project.category} {project.is_public ? '// PUBLIC' : '// PRIVATE'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '780px' }}>
                    {project.short_description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {project.technologies && project.technologies.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6875rem',
                            padding: '2px 8px',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-technical)',
                            borderRadius: 'var(--radius-xs)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <Button href={`/projects/${project.slug}`} variant="outline" size="sm">
                        View Project
                      </Button>

                      {isOwner && (
                        <Button href={`/dashboard/projects/${project.id}/edit`} variant="primary" size="sm">
                          Edit Project
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
