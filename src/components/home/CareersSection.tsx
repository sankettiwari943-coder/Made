import React from 'react';
import { siteConfig } from '@/config/site';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import styles from './CareersSection.module.css';

export const CareersSection: React.FC = () => {
  return (
    <section className={styles.careersWrapper}>
      <Container>
        <div className={styles.innerGrid}>
          {/* Large Typographic CTA */}
          <div className={styles.headlineBlock}>
            <span className="technical-label">06 // INITIATIVE</span>
            <h2 className={styles.headline}>
              <span className={styles.headlineLine}>WHAT WILL YOU</span>
              <span className={styles.headlineLineAccent}>make with us?</span>
            </h2>
          </div>

          {/* Supporting Copy & Openings CTA */}
          <div className={styles.contentBlock}>
            <p className={styles.subline}>
              We’re looking for ambitious student engineers, designers, researchers, and community operators who want to build, experiment, collaborate, and launch real systems.
            </p>

            <div className={styles.deptChips}>
              {siteConfig.departments.slice(0, 4).map((dept) => (
                <span key={dept.id} className={styles.deptChip}>
                  {dept.name}
                </span>
              ))}
            </div>

            <div className={styles.actionRow}>
              <Button href="/careers" variant="primary" size="lg" showArrow>
                VIEW OPENINGS
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
