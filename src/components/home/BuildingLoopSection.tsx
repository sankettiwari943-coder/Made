import React from 'react';
import { Container } from '../layout/Container';
import styles from './BuildingLoopSection.module.css';

interface LoopStep {
  index: string;
  word: string;
  description: string;
  meta: string;
  arrowSymbol: string;
}

const LOOP_STEPS: LoopStep[] = [
  {
    index: '01',
    word: 'IDEA',
    description: 'Transform raw curiosity into an architectural specification. Define open roles and assemble collaborators.',
    meta: 'FORMULATE // SPECIFY',
    arrowSymbol: '↓',
  },
  {
    index: '02',
    word: 'BUILD',
    description: 'Iterate with discipline. Write high-throughput systems, test user interfaces, and build outside classroom silos.',
    meta: 'ENGINEER // CRAFT',
    arrowSymbol: '↓',
  },
  {
    index: '03',
    word: 'SHIP',
    description: 'Deploy to live infrastructure. Release alpha builds to actual users, document post-mortems, and present at demo days.',
    meta: 'DEPLOY // LAUNCH',
    arrowSymbol: '↓',
  },
  {
    index: '04',
    word: 'REPEAT',
    description: 'Incorporate user feedback, iterate on architecture, start new projects, and mentor the next cohort of student builders.',
    meta: 'REFINE // EVOLVE',
    arrowSymbol: '↺',
  },
];

export const BuildingLoopSection: React.FC = () => {
  return (
    <section className={styles.loopWrapper}>
      <Container>
        <div className={styles.loopHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="technical-label">02 // METHODOLOGY</span>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">THE BUILDING LOOP</span>
          </div>
          <h2 className={styles.loopTitle}>The Continuous Building Loop</h2>
          <p className={styles.loopSubline}>
            A relentless four-step operational cycle that transforms student ideas into deployed software.
          </p>
        </div>

        {/* 4-Step Typographic Cadence */}
        <div className={styles.cadenceContainer}>
          {LOOP_STEPS.map((step) => (
            <div key={step.index} className={styles.cadenceStep}>
              <div>
                <div className={styles.stepTop}>
                  <span className={styles.stepIndex}>{step.index} //</span>
                  <span className={styles.stepArrow}>{step.arrowSymbol}</span>
                </div>
                <h3 className={styles.stepWord}>{step.word}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>

              <div className={styles.stepMeta}>{step.meta}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
