import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPublicProfileByUsername } from '@/lib/auth/authorization';
import { getPublicProjectsByUsername } from '@/lib/projects/queries';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function PublicBuilderProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const username = params.username.toLowerCase();

  // 1. Fetch Profile from Supabase database
  const profile = await getPublicProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  // 2. Fetch builder's public projects
  const publicProjects = await getPublicProjectsByUsername(username);

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-28)' }}>
      <Container>
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-10)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/builders" className="technical-label" style={{ color: 'var(--text-muted)' }}>
              BUILDERS
            </Link>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">@{profile.username}</span>
          </div>

          <Link href="/builders" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            ← All Builders
          </Link>
        </div>

        {/* Profile Masthead */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-10)',
            marginBottom: 'var(--space-16)',
            alignItems: 'start',
          }}
        >
          {/* Avatar / Portrait Block */}
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              aspectRatio: '1 / 1',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '4rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {profile.full_name.charAt(0)}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
                  BUILDER IDENTITY
                </span>
              </div>
            )}
          </div>

          {/* Builder Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Badge variant={profile.role === 'MEMBER' ? 'default' : 'accent'} useBrackets>
                {profile.role}
              </Badge>
              {profile.location && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  📍 {profile.location}
                </span>
              )}
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              {profile.full_name}
            </h1>

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', color: 'var(--accent-primary-hover)', fontWeight: 700 }}>
              @{profile.username}
            </span>

            {profile.primary_focus && (
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                Primary Focus: <strong style={{ color: 'var(--text-primary)' }}>{profile.primary_focus}</strong>
              </p>
            )}

            {profile.bio && (
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: '640px', marginTop: 'var(--space-2)' }}>
                {profile.bio}
              </p>
            )}

            {/* Social Proofs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '4px',
                  }}
                >
                  GitHub Profile ↗
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '4px',
                  }}
                >
                  LinkedIn Profile ↗
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '4px',
                  }}
                >
                  Portfolio ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Selected Builds & Repositories */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
            <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
              SELECTED BUILDS & REPOSITORIES ({publicProjects.length})
            </span>
          </div>

          {publicProjects.length === 0 ? (
            <div
              style={{
                padding: 'var(--space-12) var(--space-6)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-technical)',
                borderRadius: 'var(--radius-xs)',
                textAlign: 'center',
              }}
            >
              <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
                NO PUBLISHED BUILDS
              </span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                This builder has not published any public repositories yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
              {publicProjects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-technical)',
                    borderRadius: 'var(--radius-xs)',
                    padding: 'var(--space-6)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <Badge variant={project.status === 'LIVE' ? 'live' : 'default'} useBrackets>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                        {project.category}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', marginTop: 'var(--space-2)' }}>
                      <Link href={`/projects/${project.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {project.title}
                      </Link>
                    </h3>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 'var(--space-2)' }}>
                      {project.short_description}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link
                      href={`/projects/${project.slug}`}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--accent-primary-hover)',
                        textDecoration: 'none',
                      }}
                    >
                      VIEW BUILD →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
