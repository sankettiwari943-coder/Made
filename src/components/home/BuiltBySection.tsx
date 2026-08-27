import React from 'react';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import styles from './BuiltBySection.module.css';

export const BuiltBySection: React.FC = () => {
  return (
    <section className={styles.builtByWrapper}>
      <Container>
        <div className={styles.innerGrid}>
          {/* Official Portrait Asset */}
          <div className={styles.portraitContainer}>
            <Image
              src={siteConfig.founder.image}
              alt={`${siteConfig.founder.name} — ${siteConfig.founder.title}`}
              width={340}
              height={425}
              className={styles.portraitImage}
              priority
            />
            <div className={styles.portraitTag}>
              ARCHIVE // FOUNDER PORTRAIT
            </div>
          </div>

          {/* Restrained Founder Story */}
          <div className={styles.contentCol}>
            <div className={styles.founderHeading}>
              <span className="technical-label">07 // INITIATION</span>
              <h2 className={styles.founderName}>{siteConfig.founder.name}</h2>
              <span className={styles.founderRole}>{siteConfig.founder.title}</span>
              <span className={styles.founderOrg}>{siteConfig.founder.subtitle}</span>
            </div>

            <blockquote className={styles.introQuote}>
              &ldquo;I started MADE around a simple idea: <em>talented students shouldn’t need to wait for permission</em> to start building.&rdquo;
            </blockquote>

            <p className={styles.shortIntro}>
              MADE was created to dismantle the barrier between university coursework and shipping real products. It is an independent platform built by students, for students who want to build beyond the classroom.
            </p>

            <div className={styles.actionRow}>
              <Button href="/built-by" variant="primary" size="md" showArrow>
                READ THE STORY
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
