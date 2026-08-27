import React from 'react';
import { siteConfig } from '@/config/site';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import styles from './CtaSection.module.css';

export const CtaSection: React.FC = () => {
  return (
    <section className={styles.ctaWrapper}>
      <Container>
        <div className={styles.innerContent}>
          <span className="technical-label">07 // INITIATIVE</span>
          <h2 className={styles.headline}>
            {siteConfig.linguisticSystem.careersHeading}
          </h2>
          <p className={styles.subline}>
            We’re looking for engineers, designers, researchers, and creators who want to contribute, experiment, collaborate, and ship real systems.
          </p>

          <div className={styles.buttonRow}>
            <Button href="/auth/sign-up" variant="primary" size="lg" showArrow>
              Join MADE Now
            </Button>
            <Button href="/careers" variant="outline" size="lg">
              View Open Roles
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};
