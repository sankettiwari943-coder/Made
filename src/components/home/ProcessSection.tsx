import React from 'react';
import Link from 'next/link';
import { Container } from '../layout/Container';
import { SectionHeading } from '../editorial/SectionHeading';
import styles from './ProcessSection.module.css';

interface ProcessStep {
  number: string;
  tag: string;
  title: string;
  description: string;
  actionText: string;
  href: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    tag: 'DISCOVERY',
    title: 'FIND',
    description:
      'Discover skilled collaborators, breakthrough project ideas, hackathons, open source bounties, and research opportunities.',
    actionText: 'Explore Directory',
    href: '/builders',
  },
  {
    number: '02',
    tag: 'EXECUTION',
    title: 'BUILD',
    description:
      'Form multidisciplinary teams, claim dedicated role slots, track development velocity, and turn theoretical sketches into working code.',
    actionText: 'Start a Project',
    href: '/projects',
  },
  {
    number: '03',
    tag: 'DEPLOYMENT',
    title: 'SHIP',
    description:
      'Launch to real users, showcase your technical portfolio, present at community demo days, and build a verified builder reputation.',
    actionText: 'View Showcase',
    href: '/projects',
  },
];

export const ProcessSection: React.FC = () => {
  return (
    <section className={styles.processWrapper}>
      <Container>
        <SectionHeading
          index="02 // METHODOLOGY"
          label="HOW IT WORKS"
          title="The Building Cadence"
          description="A structured trajectory designed to take students from isolated curiosity to shipping production systems."
        />

        <div className={styles.processGrid}>
          {PROCESS_STEPS.map((step) => (
            <Link key={step.number} href={step.href} className={styles.processCard}>
              <div>
                <div className={styles.cardTop}>
                  <span className={styles.cardNumber}>{step.number} //</span>
                  <span className={styles.cardTag}>{step.tag}</span>
                </div>
                <h3 className={styles.cardTitle}>{step.title}</h3>
                <p className={styles.cardDescription}>{step.description}</p>
              </div>

              <div className={styles.cardAction}>
                <span>{step.actionText}</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};
