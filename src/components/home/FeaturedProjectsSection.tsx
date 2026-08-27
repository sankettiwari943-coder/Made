import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { getFeaturedProjects } from '@/lib/projects/queries';
import { Container } from '../layout/Container';
import { SectionHeading } from '../editorial/SectionHeading';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './FeaturedProjectsSection.module.css';

export const FeaturedProjectsSection = async () => {
  const projects = await getFeaturedProjects(3);

  return (
    <section className={styles.projectsWrapper}>
      <Container>
        <SectionHeading
          index="03 // PORTFOLIO"
          label="FEATURED BUILDS"
          title={siteConfig.linguisticSystem.projectsHeading}
          description="Curated systems, experiments, and tools engineered by MADE members."
          action={
            <Button href="/projects" variant="outline" size="sm" showArrow>
              View All Projects
            </Button>
          }
        />

        {projects.length === 0 ? (
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
              FEATURED BUILDS // 2026
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
              Nothing Shipped Here. Yet.
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
              The workspace is ready. Publish the first build to feature your engineering work.
            </p>
            <Button href="/projects" variant="primary" size="md" showArrow>
              Explore Projects
            </Button>
          </div>
        ) : (
          <div className={styles.projectList}>
            {projects.map((project, idx) => {
              const formattedIndex = `0${idx + 1} / PROJECT`;
              const statusVariant =
                project.status === 'LIVE'
                  ? 'live'
                  : project.status === 'BUILDING'
                  ? 'building'
                  : project.status === 'PROTOTYPE'
                  ? 'prototype'
                  : 'default';

              return (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className={styles.projectRow}
                >
                  <div className={styles.projectIndex}>{formattedIndex}</div>

                  <div className={styles.projectIdentity}>
                    <div className={styles.projectNameRow}>
                      <h3 className={styles.projectName}>{project.title}</h3>
                      <Badge variant={statusVariant} useBrackets>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className={styles.projectCategory}>{project.category}</span>
                  </div>

                  <div className={styles.projectContent}>
                    <p className={styles.projectTagline}>{project.short_description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className={styles.techStack}>
                        {project.technologies.map((tech) => (
                          <span key={tech} className={styles.techChip}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.projectAction}>
                    <span>View Project</span>
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
