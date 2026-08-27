import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProjectBySlug } from '@/lib/projects/queries';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

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

  const formattedCreated = new Date(project.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedUpdated = new Date(project.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-28)' }}>
      <Container>
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-10)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/projects" className="technical-label" style={{ color: 'var(--text-muted)' }}>
              PROJECTS
            </Link>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">{project.category}</span>
          </div>

          <Link href="/projects" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            ← All Projects
          </Link>
        </div>

        {/* Project Header Masthead */}
        <div style={{ marginBottom: 'var(--space-16)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Badge variant={statusVariant} useBrackets>
              {project.status.replace('_', ' ')}
            </Badge>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {project.is_public ? '[ PUBLIC BUILD ]' : '[ PRIVATE WORKSPACE ]'}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.75rem, 6.5vw, 5rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 0.95,
              marginBottom: 'var(--space-4)',
            }}
          >
            {project.title}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              color: 'var(--text-primary)',
              maxWidth: '820px',
              lineHeight: 1.4,
              fontStyle: 'italic',
            }}
          >
            &ldquo;{project.short_description}&rdquo;
          </p>

          {/* Quick Action Links Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
            {project.live_url && (
              <Button href={project.live_url} target="_blank" rel="noopener noreferrer" variant="primary" size="md" showArrow>
                Visit Live Build
              </Button>
            )}
            {project.github_url && (
              <Button href={project.github_url} target="_blank" rel="noopener noreferrer" variant="outline" size="md">
                GitHub Repository ↗
              </Button>
            )}
            {project.demo_url && (
              <Button href={project.demo_url} target="_blank" rel="noopener noreferrer" variant="outline" size="md">
                Watch Demo Video ↗
              </Button>
            )}
          </div>
        </div>

        {/* 2-Column Asymmetric Case Study Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-12)',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--space-12)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-12)',
              alignItems: 'start',
            }}
          >
            {/* Left Column: About & Build Logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
              {/* Cover Image if uploaded */}
              {project.cover_image && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    border: '1px solid var(--border-technical)',
                    backgroundColor: 'var(--bg-surface)',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={project.cover_image}
                    alt={project.title}
                    fill
                    priority
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* 01 // ABOUT THE BUILD */}
              <div>
                <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-4)' }}>
                  01 // ABOUT THE BUILD
                </span>
                <div
                  style={{
                    fontSize: '1.0625rem',
                    lineHeight: 1.8,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {project.description}
                </div>
              </div>

              {/* 02 // BUILD LOGS */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                  <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
                    02 // CHRONOLOGICAL BUILD LOGS
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {project.updates?.length || 0} LOGGED MILESTONES
                  </span>
                </div>

                {project.updates && project.updates.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {project.updates.map((update) => (
                      <div
                        key={update.id}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          padding: 'var(--space-6)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                            {update.title}
                          </h4>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                            {new Date(update.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                          {update.content}
                        </p>

                        {update.author && (
                          <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-technical)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                              LOGGED BY:
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                              {update.author.full_name}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-technical)', borderRadius: 'var(--radius-xs)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      No public build logs logged for this repository yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Spec Sidebar (The Stack, Builders, Metadata) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              {/* THE STACK */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-technical)',
                  borderRadius: 'var(--radius-xs)',
                  padding: 'var(--space-6)',
                }}
              >
                <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
                  THE TECH STACK
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {project.technologies && project.technologies.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-technical)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-xs)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* BUILDERS */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-technical)',
                  borderRadius: 'var(--radius-xs)',
                  padding: 'var(--space-6)',
                }}
              >
                <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
                  BUILDERS & CONTRIBUTORS
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {project.owner && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <Link
                          href={project.owner.username ? `/builders/${project.owner.username}` : '#'}
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            textDecoration: 'underline',
                          }}
                        >
                          {project.owner.full_name}
                        </Link>
                        {project.owner.username && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                            @{project.owner.username}
                          </span>
                        )}
                      </div>
                      <Badge variant="accent" useBrackets>
                        OWNER
                      </Badge>
                    </div>
                  )}

                  {project.members &&
                    project.members
                      .filter((m) => m.role !== 'OWNER' && m.profile)
                      .map((member) => (
                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Link
                            href={member.profile?.username ? `/builders/${member.profile.username}` : '#'}
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '0.9375rem',
                              color: 'var(--text-secondary)',
                              textDecoration: 'underline',
                            }}
                          >
                            {member.profile?.full_name || 'Collaborator'}
                          </Link>
                          <Badge variant="default" useBrackets>
                            COLLABORATOR
                          </Badge>
                        </div>
                      ))}
                </div>
              </div>

              {/* SPECIFICATION META */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  padding: 'var(--space-6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                <span className="technical-label">PROJECT SPECIFICATIONS</span>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-technical)', paddingBottom: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                    CATEGORY:
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                    {project.category}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-technical)', paddingBottom: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                    INITIAL ARCHITECTURE:
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formattedCreated}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                    LAST DEPLOYMENT:
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formattedUpdated}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
