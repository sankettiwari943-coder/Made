import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { Container } from '../layout/Container';
import { SectionHeading } from '../editorial/SectionHeading';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './ProjectsSection.module.css';

interface ShowcaseProject {
  number: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  techStack: string[];
  status: 'live' | 'building' | 'opensource';
  statusLabel: string;
}

const FEATURED_PROJECTS: ShowcaseProject[] = [
  {
    number: '01',
    slug: 'aegis-intelligence',
    name: 'AEGIS',
    tagline: 'AI-powered geospatial disaster response intelligence and real-time evacuation routing.',
    category: 'AI / COMPUTER VISION / GIS',
    techStack: ['PyTorch', 'FastAPI', 'Mapbox GL', 'WebAssembly'],
    status: 'live',
    statusLabel: 'LIVE',
  },
  {
    number: '02',
    slug: 'nexus-v-runtime',
    name: 'NEXUS-V',
    tagline: 'High-throughput peer-to-peer compute substrate built for low-latency browser workloads.',
    category: 'DISTRIBUTED SYSTEMS / RUST',
    techStack: ['Rust', 'WebRTC', 'Tokio', 'Protobuf'],
    status: 'building',
    statusLabel: 'BUILDING',
  },
  {
    number: '03',
    slug: 'orbital-design-engine',
    name: 'ORBITAL',
    tagline: 'Deterministic design token compiler and headless component matrix for technical web applications.',
    category: 'DEVELOPER TOOLS / DESIGN',
    techStack: ['TypeScript', 'AST Parser', 'Vanilla CSS', 'Next.js'],
    status: 'opensource',
    statusLabel: 'OPEN SOURCE',
  },
];

export const ProjectsSection: React.FC = () => {
  return (
    <section className={styles.projectsWrapper}>
      <Container>
        <SectionHeading
          index="03 // PROJECTS"
          label="PORTFOLIO ARCHIVE"
          title={siteConfig.linguisticSystem.projectsHeading}
          description="Curated systems, experiments, and tools engineered by MADE members."
          action={
            <Button href="/projects" variant="outline" size="sm" showArrow>
              View All Projects
            </Button>
          }
        />

        <div className={styles.projectList}>
          {FEATURED_PROJECTS.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className={styles.projectRow}
            >
              {/* Project Number */}
              <div className={styles.projectIndex}>{project.number} //</div>

              {/* Name & Category */}
              <div className={styles.projectIdentity}>
                <div className={styles.projectNameRow}>
                  <h3 className={styles.projectName}>{project.name}</h3>
                  <Badge variant={project.status} useBrackets>
                    {project.statusLabel}
                  </Badge>
                </div>
                <span className={styles.projectCategory}>{project.category}</span>
              </div>

              {/* Tagline & Tech Stack */}
              <div className={styles.projectContent}>
                <p className={styles.projectTagline}>{project.tagline}</p>
                <div className={styles.techStack}>
                  {project.techStack.map((tech) => (
                    <span key={tech} className={styles.techChip}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className={styles.projectAction}>
                <span>View Project</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};
