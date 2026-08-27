import React from 'react';
import { Container } from '../layout/Container';
import styles from './IntroSection.module.css';

export const IntroSection: React.FC = () => {
  return (
    <section className={styles.introWrapper}>
      <Container>
        {/* Editorial Section Label */}
        <div className={styles.labelRow}>
          <span className="technical-label">01 // MANIFESTO</span>
          <span style={{ color: 'var(--border-regular)' }}>//</span>
          <span className="technical-label">WHAT IS MADE?</span>
        </div>

        {/* Manifesto Statement */}
        <div className={styles.manifestoBlock}>
          <blockquote className={styles.statement}>
            MADE is for students who don’t want to <em>stop at ideas</em>.
          </blockquote>

          <div className={styles.credoRow}>
            <span className={styles.credoItem}>We build.</span>
            <span className={styles.credoDot} />
            <span className={styles.credoItem}>We collaborate.</span>
            <span className={styles.credoDot} />
            <span className={styles.credoItem}>We ship.</span>
          </div>
        </div>

        {/* Dual Column Context */}
        <div className={styles.narrativeGrid}>
          <p className={styles.bodyText}>
            Traditional college computer science and engineering coursework provides rigorous theory, but true capability is forged when students <strong>take ownership of real systems</strong>. MADE is an independent platform for builders who want to create without gatekeepers.
          </p>
          <p className={styles.bodyText}>
            Whether you are training computer vision models, writing low-level systems in Rust, engineering design systems, or organizing hackathons—MADE gives you the collaborators, the structure, and the audience to <strong>make something real</strong>.
          </p>
        </div>
      </Container>
    </section>
  );
};
