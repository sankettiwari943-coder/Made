import React from 'react';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import styles from './BuiltByPreview.module.css';

export const BuiltByPreview: React.FC = () => {
  return (
    <section className={styles.builtByWrapper}>
      <Container>
        <div className={styles.builtByGrid}>
          {/* Official Portrait Asset */}
          <div className={styles.portraitContainer}>
            <Image
              src={siteConfig.founder.image}
              alt={`${siteConfig.founder.name} — ${siteConfig.founder.title}`}
              width={380}
              height={475}
              className={styles.portraitImage}
              priority
            />
            <div className={styles.portraitTag}>
              OFFICIAL ARCHIVE // SANKET TIWARI
            </div>
          </div>

          {/* Editorial Story */}
          <div className={styles.contentCol}>
            <div>
              <span className={styles.founderRole}>{siteConfig.founder.title} — {siteConfig.founder.subtitle}</span>
              <h2 className={styles.founderName}>{siteConfig.founder.name}</h2>
            </div>

            <blockquote className={styles.quoteText}>
              &ldquo;I started MADE around a simple idea: <em>talented students shouldn’t need to wait for permission</em> to start building.&rdquo;
            </blockquote>

            <p className={styles.bodyText}>
              MADE was initiated to bridge the gap between coursework and shipping production systems. An independent innovation platform created by students, for students who want to build beyond the classroom.
            </p>

            {/* Technical Focus Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '8px 0' }}>
              {siteConfig.founder.technicalFocus.map((focus) => (
                <span
                  key={focus}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    padding: '2px 8px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-technical)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {focus}
                </span>
              ))}
            </div>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '16px', margin: '8px 0 16px' }}>
              <a
                href={siteConfig.founder.socials.linkedin}
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
                href={siteConfig.founder.socials.github}
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
                href={siteConfig.founder.socials.portfolio}
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

            <div className={styles.actionRow}>
              <Button href="/built-by" variant="primary" size="md" showArrow>
                Read Founder Story & Vision
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
