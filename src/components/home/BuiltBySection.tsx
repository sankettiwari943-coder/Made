import React from 'react';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import styles from './BuiltBySection.module.css';

export const BuiltBySection: React.FC = () => {
  const { team } = siteConfig;

  return (
    <section className={styles.builtByWrapper}>
      <Container>
        <div className={styles.headerRow}>
          <div className={styles.labelWrapper}>
            <span className={styles.technicalIndex}>09 // LEADERSHIP</span>
            <span className={styles.labelDivider}>//</span>
            <span className={styles.categoryLabel}>WHO BUILT MADE?</span>
          </div>
          <h2 className={styles.sectionTitle}>{siteConfig.linguisticSystem.builtByHeading}</h2>
          <p className={styles.sectionDescription}>
            MADE is an independent platform created by students, for students who want to build beyond the classroom.
          </p>
        </div>

        <div className={styles.teamGrid}>
          {team.map((member, idx) => {
            const indexStr = `0${idx + 1}`;
            return (
              <div key={member.name} className={styles.memberCard}>
                {/* Greyscale avatar styling with hover zoom/transition */}
                <div className={styles.portraitContainer}>
                  <Image
                    src={member.image}
                    alt={`${member.name} — ${member.title}`}
                    width={480}
                    height={540}
                    className={styles.portraitImage}
                    priority={idx === 0}
                  />
                  <div className={styles.portraitTag}>
                    OFFICIAL ARCHIVE // {member.name.toUpperCase()}
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div>
                    {/* Monospace role indicator */}
                    <div className={styles.roleIndicator}>{member.roleIndicator}</div>
                    <h3 className={styles.memberName}>{member.name}</h3>
                  </div>

                  {member.tagline && (
                    <blockquote className={styles.memberQuote}>
                      &ldquo;{member.tagline}&rdquo;
                    </blockquote>
                  )}

                  {member.intro && (
                    <p className={styles.memberBio}>{member.intro}</p>
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

                  {/* Direct Clickable Social Links */}
                  <div className={styles.cardFooter}>
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
                    <span className={styles.disciplineBadge}>
                      {indexStr} // {member.discipline}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.footerAction}>
          <Button href="/built-by" variant="primary" size="md" showArrow>
            READ THE ORIGIN & MANIFESTO
          </Button>
        </div>
      </Container>
    </section>
  );
};
