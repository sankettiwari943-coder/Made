import React from 'react';
import { siteConfig } from '@/config/site';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import styles from './HeroSection.module.css';

export const HeroSection: React.FC = () => {
  return (
    <section className={styles.heroWrapper}>
      <Container>
        {/* Top Brand Identity & Technical Metadata */}
        <div className={styles.topBrandRow}>
          <div className={styles.brandLabel}>
            <span className={styles.brandDot} />
            <span>MADE // PLATFORM</span>
          </div>

          <div className={styles.metaTags}>
            <span className={styles.metaItem}>MADE / 2026</span>
            <span className={styles.metaDivider}>//</span>
            <span className={styles.metaItem}>STUDENT BUILDERS</span>
            <span className={styles.metaDivider}>//</span>
            <span className={styles.metaItem}>PROJECTS / PEOPLE / OPPORTUNITIES</span>
          </div>
        </div>

        {/* Asymmetric Hero Grid */}
        <div className={styles.headlineGrid}>
          {/* Stacked Editorial Headline */}
          <h1 className={styles.headline}>
            <span className={styles.headlineLine}>MAKE</span>
            <span className={styles.headlineLineAccent}>SOMETHING</span>
            <span className={styles.headlineLineSerif}>REAL.</span>
          </h1>

          {/* Hero Identity Narrative & Dual CTAs */}
          <div className={styles.heroContent}>
            <blockquote className={styles.manifestoLine}>
              &ldquo;MADE is for students who don’t want to <em>stop at ideas</em>.&rdquo;
            </blockquote>

            <p className={styles.leadText}>
              A student-powered platform for ambitious engineers, designers, and researchers who build, collaborate, and ship real systems.
            </p>

            <div className={styles.ctaGroup}>
              <Button href="/projects" variant="primary" size="lg" showArrow>
                EXPLORE PROJECTS
              </Button>
              <Button href="/signup" variant="outline" size="lg" showArrow>
                JOIN MADE
              </Button>
            </div>
          </div>
        </div>

        {/* Sub-Structure Spec Columns */}
        <div className={styles.heroBottomBar}>
          <div className={styles.bottomSpecItem}>
            <span className={styles.specIndex}>01 // DISCOVERY</span>
            <span className={styles.specLabel}>Interdisciplinary Roster</span>
            <p className={styles.specDetail}>
              Engineers, designers, and creators discovering collaborators across disciplines.
            </p>
          </div>

          <div className={styles.bottomSpecItem}>
            <span className={styles.specIndex}>02 // ARCHITECTURE</span>
            <span className={styles.specLabel}>Zero-Permission Building</span>
            <p className={styles.specDetail}>
              Form teams, claim designated role slots, and architect systems without waiting for approval.
            </p>
          </div>

          <div className={styles.bottomSpecItem}>
            <span className={styles.specIndex}>03 // DEPLOYMENT</span>
            <span className={styles.specLabel}>Production Launch</span>
            <p className={styles.specDetail}>
              Deploy repositories to real users, review architectures at demo days, and build verified reputations.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};
