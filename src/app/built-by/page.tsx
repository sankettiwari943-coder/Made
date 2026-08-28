import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Built By — Sanket Tiwari | MADE',
  description: 'The origin, philosophy, and architectural vision behind MADE, built by Founder & President Sanket Tiwari.',
};

export default function BuiltByPage() {
  const { founder } = siteConfig;

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-28)' }}>
      <Container>
        {/* Top Editorial Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-12)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
              06 // ARCHIVE & FOUNDATION
            </span>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">WHO BUILT MADE?</span>
          </div>

          <Link href="/projects" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            Explore Builds →
          </Link>
        </div>

        {/* Hero Portrait & Editorial Masthead */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-12)', alignItems: 'start', marginBottom: 'var(--space-20)' }}>
          {/* Authentic Photographic Portrait */}
          <div
            style={{
              position: 'relative',
              aspectRatio: '4 / 5',
              border: '1px solid var(--border-technical)',
              backgroundColor: 'var(--bg-surface)',
              overflow: 'hidden',
              maxWidth: '440px',
            }}
          >
            <Image
              src={founder.image}
              alt={`${founder.name} — ${founder.title}`}
              width={440}
              height={550}
              priority
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'grayscale(100%) contrast(1.1)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 'var(--space-4)',
                left: 'var(--space-4)',
                backgroundColor: 'rgba(12, 12, 14, 0.92)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                border: '1px solid var(--border-technical)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.1em',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
              }}
            >
              OFFICIAL ARCHIVE // SANKET TIWARI
            </div>
          </div>

          {/* Founder Identity & Statement */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {founder.title} — {founder.subtitle}
              </span>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.75rem, 6vw, 4.75rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                  lineHeight: 0.95,
                  marginTop: 'var(--space-2)',
                }}
              >
                {founder.name}
              </h1>
            </div>

            <blockquote
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.35rem, 3vw, 2rem)',
                fontWeight: 400,
                lineHeight: 1.35,
                color: 'var(--text-primary)',
                borderLeft: '2px solid var(--accent-primary)',
                paddingLeft: 'var(--space-6)',
                margin: 'var(--space-2) 0',
              }}
            >
              &ldquo;I started MADE around a simple idea: <em>talented students shouldn’t need to wait for permission</em> to start building.&rdquo;
            </blockquote>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {founder.technicalFocus.map((focus) => (
                <span
                  key={focus}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    padding: '3px 10px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-technical)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {focus}
                </span>
              ))}
            </div>

            {/* Social Proof & Links */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
              <a
                href={founder.socials.linkedin}
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
                LinkedIn ↗
              </a>
              <a
                href={founder.socials.github}
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
                GitHub ↗
              </a>
              <a
                href={founder.socials.portfolio}
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
            </div>
          </div>
        </div>

        {/* Narrative Essay Block */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-16)', marginBottom: 'var(--space-20)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-12)' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
                01 // ORIGIN
              </h3>
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                MADE began with a direct observation: university classrooms excel at theoretical foundations, but software and hardware innovation accelerate through continuous, hands-on iteration.
              </p>
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                We established MADE as an open collective to provide students with the infrastructure, peers, and momentum required to turn prototype code into published systems.
              </p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
                02 // THE PROBLEM
              </h3>
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Student builders often operate in isolation. Projects stall at the local repository phase because finding high-agency co-builders, code reviewers, and public distribution is unnecessarily difficult.
              </p>
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                MADE solves this by making building public, collaborative, and verifiable.
              </p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
                03 // THE BELIEF
              </h3>
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                We believe engineering competence is proven through shipped software rather than theoretical credentials alone.
              </p>
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                When you design transparent build logs, commit to public repositories, and share architecture trade-offs, your work creates its own proof of competence.
              </p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
                04 // THE FUTURE
              </h3>
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                MADE is expanding its directory of student-engineered systems, open-source tooling, and weekend sprint gatherings globally.
              </p>
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                Our vision is to remain the primary home for ambitious students who want to build something real.
              </p>
            </div>
          </div>
        </div>

        {/* 05 // Evolution Timeline */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-16)', marginBottom: 'var(--space-20)' }}>
          <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-8)' }}>
            05 // PLATFORM EVOLUTION
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-8)' }}>
            <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-technical)', borderRadius: 'var(--radius-xs)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                STAGE 01 //
              </span>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '4px' }}>
                The Idea
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.6 }}>
                Recognizing the need for a dedicated student engineering platform without corporate noise.
              </p>
            </div>

            <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-technical)', borderRadius: 'var(--radius-xs)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                STAGE 02 //
              </span>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '4px' }}>
                First Build
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.6 }}>
                Prototyping the Blueprint Laboratory design system and authenticated builder workspace.
              </p>
            </div>

            <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-technical)', borderRadius: 'var(--radius-xs)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                STAGE 03 //
              </span>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '4px' }}>
                The Collective
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.6 }}>
                Launching project collaboration, build updates, and public project case studies.
              </p>
            </div>

            <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-technical)', borderRadius: 'var(--radius-xs)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                STAGE 04 //
              </span>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '4px' }}>
                Global Community
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.6 }}>
                Expanding opportunities, live build gatherings, and multidisciplinary career fellowships.
              </p>
            </div>
          </div>
        </div>

        {/* 06 // Built With Restrained Matrix */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-16)', marginBottom: 'var(--space-20)' }}>
          <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-6)' }}>
            06 // BUILT WITH
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            {[
              { tech: 'NEXT.JS 14', desc: 'App Router & Server Component Architecture' },
              { tech: 'TYPESCRIPT', desc: 'Strict End-to-End Type Safety' },
              { tech: 'SUPABASE', desc: 'PostgreSQL, Row Level Security & Auth' },
              { tech: 'DIRECTION B CSS', desc: 'Zero-Framework Curated CSS Tokens' },
              { tech: 'ZOD', desc: 'Runtime Schema & Payload Validation' },
            ].map((item) => (
              <div key={item.tech} style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  {item.tech}
                </strong>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 07 // Founder CTA */}
        <div
          style={{
            padding: 'var(--space-12) var(--space-8)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            textAlign: 'center',
          }}
        >
          <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
            MADE // INITIATIVE
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginTop: 'var(--space-2)',
            }}
          >
            Make something real.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: 'var(--space-3) auto var(--space-8)' }}>
            Explore active student systems or join the collective to start building.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <Button href="/projects" variant="primary" size="lg" showArrow>
              EXPLORE PROJECTS
            </Button>
            <Button href="/signup" variant="outline" size="lg">
              JOIN MADE →
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
