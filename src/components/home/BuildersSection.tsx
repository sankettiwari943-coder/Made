import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { createClient } from '@/lib/supabase/server';
import { Container } from '../layout/Container';
import { SectionHeading } from '../editorial/SectionHeading';
import { Button } from '../ui/Button';
import styles from './BuildersSection.module.css';

export const BuildersSection = async () => {
  const supabase = createClient();
  let builders: any[] = [];

  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role, username, primary_focus, current_build')
      .eq('onboarding_completed', true)
      .not('username', 'is', null)
      .order('created_at', { ascending: false })
      .limit(4);

    if (data) {
      builders = data;
    }
  } catch {
    builders = [];
  }

  return (
    <section className={styles.buildersWrapper}>
      <Container>
        <SectionHeading
          index="04 // BUILDERS"
          label="COMMUNITY DIRECTORY"
          title={siteConfig.linguisticSystem.buildersHeading}
          description="The student engineers, researchers, and designers turning ideas into shipped software."
          action={
            <Button href="/builders" variant="outline" size="sm" showArrow>
              MEET THE BUILDERS
            </Button>
          }
        />

        {builders.length === 0 ? (
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
              BUILDERS / 2026
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
              The Builder Directory is Just Opening.
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
              No profiles have been published yet. Complete your profile to appear in the directory.
            </p>
            <Button href="/signup" variant="primary" size="md" showArrow>
              Create Your Profile
            </Button>
          </div>
        ) : (
          <div className={styles.builderDirectory}>
            <div className={styles.builderHeaderRow}>
              <span>INDEX</span>
              <span>NAME & ROLE</span>
              <span>FOCUS</span>
              <span>CURRENT BUILD</span>
              <span>PROFILE</span>
            </div>

            {builders.map((builder, idx) => {
              const formattedIndex = `0${idx + 1}`;
              return (
                <Link
                  key={builder.username}
                  href={`/builders/${builder.username}`}
                  className={styles.builderRow}
                >
                  <div className={styles.builderIndex}>{formattedIndex} //</div>

                  <div className={styles.builderIdentity}>
                    <h4 className={styles.builderName}>{builder.full_name}</h4>
                    <span className={styles.builderRole}>{builder.role}</span>
                  </div>

                  <div className={styles.focusTag}>{builder.primary_focus || 'Engineering'}</div>

                  <div className={styles.currentBuildBlock}>
                    <span className={styles.buildTitle}>{builder.current_build || 'Active Build'}</span>
                  </div>

                  <div className={styles.builderAction}>
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
