import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import styles from './BuiltByPage.module.css';

export const metadata = {
  title: 'Built By — Sanket Tiwari & Apurva Diwedi | MADE',
  description: 'The origin, philosophy, and architectural vision behind MADE, built by Founder & President Sanket Tiwari and Vice President Apurva Diwedi.',
};

export default function BuiltByPage() {
  const { team, founder } = siteConfig;

  return (
    <div className={styles.pageWrapper}>
      <Container>
        {/* Top Editorial Breadcrumb */}
        <div className={styles.breadcrumbRow}>
          <div className={styles.breadcrumbLeft}>
            <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
              06 // ARCHIVE & FOUNDATION
            </span>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">WHO BUILT MADE?</span>
          </div>

          <Link
            href="/projects"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-primary)',
              textDecoration: 'underline',
            }}
          >
            Explore Builds →
          </Link>
        </div>

        {/* 01 // Executive Leadership & Core Team Grid */}
        <section className={styles.leadershipSection}>
          <div className={styles.leadershipHeader}>
            <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              01 // EXECUTIVE LEADERSHIP & ARCHITECTURE
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                lineHeight: 1,
                margin: 0,
              }}
            >
              The People Behind MADE
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginTop: 'var(--space-3)',
                maxWidth: '680px',
              }}
            >
              MADE is directed by student builders dedicated to engineering production-grade systems and empowering high-agency peers.
            </p>
          </div>

          <div className={styles.leadershipGrid}>
            {team.map((member, idx) => {
              const isFirst = idx === 0;
              return (
                <React.Fragment key={member.name}>
                  <div className={styles.memberBlock}>
                    {/* Greyscale avatar styling with hover zoom/transition */}
                    <div className={styles.portraitContainer}>
                      <Image
                        src={member.image}
                        alt={`${member.name} — ${member.title}`}
                        width={440}
                        height={550}
                        priority={isFirst}
                        className={styles.portraitImage}
                      />
                      <div className={styles.portraitTag}>
                        OFFICIAL ARCHIVE // {member.name.toUpperCase()}
                      </div>
                    </div>

                    {/* Member Identity, Statement & Bio */}
                    <div className={styles.memberInfo}>
                      <div>
                        {/* Monospace role indicator */}
                        <span className={styles.roleIndicator}>
                          {member.roleIndicator}
                        </span>
                        <h1 className={styles.memberName}>
                          {member.name}
                        </h1>
                      </div>

                      {member.tagline && (
                        <blockquote className={styles.memberQuote}>
                          &ldquo;{member.tagline}&rdquo;
                        </blockquote>
                      )}

                      {member.biography && member.biography.length > 0 && (
                        <div className={styles.memberBioList}>
                          {member.biography.map((paragraph, pIdx) => (
                            <p key={pIdx} className={styles.memberBio}>
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Technical Focus Chips */}
                      {member.technicalFocus && (
                        <div className={styles.focusChips}>
                          {member.technicalFocus.map((focus) => (
                            <span key={focus} className={styles.focusChip}>
                              {focus}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Social Proof & Direct Clickable Links */}
                      <div className={styles.socialRow}>
                        {member.socials.linkedin && (
                          <a
                            href={member.socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                          >
                            LinkedIn ↗
                          </a>
                        )}
                        {member.socials.github && (
                          <a
                            href={member.socials.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                          >
                            GitHub ↗
                          </a>
                        )}
                        {member.socials.portfolio && (
                          <a
                            href={member.socials.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                          >
                            Portfolio ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {isFirst && <hr className={styles.memberDivider} />}
                </React.Fragment>
              );
            })}
          </div>
        </section>

        {/* Narrative Essay Block */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-16)', marginBottom: 'var(--space-20)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-12)' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
                02 // ORIGIN
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
                03 // THE PROBLEM
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
                04 // THE BELIEF
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
                05 // THE FUTURE
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

        {/* 06 // Evolution Timeline */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-16)', marginBottom: 'var(--space-20)' }}>
          <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-8)' }}>
            06 // PLATFORM EVOLUTION
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

        {/* 07 // Built With Restrained Matrix */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-16)', marginBottom: 'var(--space-20)' }}>
          <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-6)' }}>
            07 // BUILT WITH
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

        {/* 08 // Founder CTA */}
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
