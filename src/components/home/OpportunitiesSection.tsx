import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { getPublicOpportunities } from '@/lib/opportunities/queries';
import { Container } from '../layout/Container';
import { SectionHeading } from '../editorial/SectionHeading';
import { Button } from '../ui/Button';
import styles from './OpportunitiesSection.module.css';

export const OpportunitiesSection = async () => {
  const opportunities = await getPublicOpportunities();
  const displayOpps = opportunities.slice(0, 4);

  return (
    <section className={styles.oppsWrapper}>
      <Container>
        <SectionHeading
          index="05 // INITIATIVES"
          label="FORWARD MOVES"
          title={siteConfig.linguisticSystem.opportunitiesHeading}
          description="Curated hackathons, research collaborations, open roles, and technical events."
          action={
            <Button href="/opportunities" variant="outline" size="sm" showArrow>
              EXPLORE OPPORTUNITIES
            </Button>
          }
        />

        {displayOpps.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-12) var(--space-8)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              textAlign: 'center',
              marginTop: 'var(--space-8)',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
              OPPORTUNITIES // 2026
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                marginTop: 'var(--space-2)',
              }}
            >
              Nothing Open Right Now.
            </h3>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                maxWidth: '440px',
                margin: 'var(--space-3) auto var(--space-6)',
                lineHeight: 1.6,
              }}
            >
              We&apos;re keeping the board clean until there&apos;s something worth applying to.
            </p>
            <Button href="/projects" variant="primary" size="md" showArrow>
              Explore Projects
            </Button>
          </div>
        ) : (
          <div className={styles.oppsList}>
            <div className={styles.oppsHeaderRow}>
              <span>DATE</span>
              <span>OPPORTUNITY & SPONSOR</span>
              <span>CATEGORY</span>
              <span>DETAILS</span>
            </div>

            {displayOpps.map((opp) => {
              const formattedDate = opp.deadline
                ? new Date(opp.deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()
                : 'ROLLING';

              return (
                <Link
                  key={opp.id}
                  href={`/opportunities/${opp.slug}`}
                  className={styles.oppsRow}
                >
                  <div className={styles.dateBlock}>{formattedDate} //</div>

                  <div className={styles.titleBlock}>
                    <h4 className={styles.oppTitle}>{opp.title}</h4>
                    <span className={styles.oppOrg}>{opp.organization}</span>
                  </div>

                  <div className={styles.typeBlock}>
                    <span className={styles.oppType}>[{opp.type}]</span>
                  </div>

                  <div className={styles.actionBlock}>
                    <span>View</span>
                    <span>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
};
