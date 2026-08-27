'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { ProjectWithDetails } from '@/lib/supabase/types';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/editorial/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'ALL STATUSES', value: 'ALL' },
  { label: '[ LIVE ]', value: 'LIVE' },
  { label: '[ BUILDING ]', value: 'BUILDING' },
  { label: '[ PROTOTYPE ]', value: 'PROTOTYPE' },
  { label: '[ OPEN SOURCE ]', value: 'OPEN_SOURCE' },
  { label: '[ IDEA ]', value: 'IDEA' },
];

const CATEGORY_FILTERS = [
  'ALL',
  'AI / ML',
  'Web & Cloud',
  'Mobile',
  'Cybersecurity',
  'Hardware',
  'Design',
  'Research',
  'Systems & Compilers',
];

export default function ProjectsDirectoryPage() {
  const { isConfigured } = getSupabaseEnv();

  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConfigured) return;

    const fetchProjects = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(Boolean(user));

        const { data: projectsData, error } = await supabase
          .from('projects')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error || !projectsData || projectsData.length === 0) {
          setProjects([]);
          setIsLoading(false);
          return;
        }

        const projectIds = projectsData.map((p) => p.id);
        const ownerIds = Array.from(new Set(projectsData.map((p) => p.owner_id)));

        const { data: techData } = await supabase
          .from('project_technologies')
          .select('project_id, technology')
          .in('project_id', projectIds);

        const techMap: Record<string, string[]> = {};
        if (techData) {
          techData.forEach((t) => {
            if (!techMap[t.project_id]) techMap[t.project_id] = [];
            techMap[t.project_id].push(t.technology);
          });
        }

        const { data: ownersData } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, role, primary_focus')
          .in('id', ownerIds);

        const ownerMap: Record<string, any> = {};
        if (ownersData) {
          ownersData.forEach((o) => {
            ownerMap[o.id] = o;
          });
        }

        const hydrated: ProjectWithDetails[] = projectsData.map((p) => ({
          ...p,
          technologies: techMap[p.id] || [],
          owner: ownerMap[p.owner_id] || undefined,
        }));

        setProjects(hydrated);
      } catch {
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [isConfigured]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.short_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.technologies &&
          project.technologies.some((t) =>
            t.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      const matchesStatus =
        selectedStatus === 'ALL' || project.status === selectedStatus;

      const matchesCategory =
        selectedCategory === 'ALL' || project.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projects, searchTerm, selectedStatus, selectedCategory]);

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-28)' }}>
      <Container>
        {/* Section Heading */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <SectionHeading
            index="DIRECTORY"
            label="PROJECTS / 2026"
            title="What's Being Made?"
            description="Explore systems, software prototypes, and engineering experiments deployed by student builders across the MADE ecosystem."
          />
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >
          {/* Search Input */}
          <div style={{ maxWidth: '480px' }}>
            <Input
              type="search"
              placeholder="Search by system title, tech stack (e.g. Rust, PyTorch), or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter Chips */}
          <div>
            <span
              className="technical-label"
              style={{ display: 'block', marginBottom: 'var(--space-2)' }}
            >
              BUILD STATUS
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {STATUS_FILTERS.map((filter) => {
                const isSelected = selectedStatus === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setSelectedStatus(filter.value)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      padding: '4px 10px',
                      backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-canvas)',
                      color: isSelected ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-technical)',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div>
            <span
              className="technical-label"
              style={{ display: 'block', marginBottom: 'var(--space-2)' }}
            >
              DOMAIN / CATEGORY
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {CATEGORY_FILTERS.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      padding: '4px 10px',
                      backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-canvas)',
                      color: isSelected ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-technical)',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Stream / Intentional Empty State */}
        {isLoading ? (
          <div style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
            <span className="technical-label">LOADING PROJECT DIRECTORY...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-16) var(--space-8)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              textAlign: 'center',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
              PROJECTS / 2026
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.25rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                marginTop: 'var(--space-2)',
              }}
            >
              Nothing Shipped Here. Yet.
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                maxWidth: '480px',
                margin: 'var(--space-3) auto var(--space-8)',
                lineHeight: 1.6,
              }}
            >
              The workspace is ready. The next build could be yours.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
              <Button
                href={isAuthenticated ? '/dashboard/projects/new' : '/signup'}
                variant="primary"
                size="lg"
                showArrow
              >
                {isAuthenticated ? 'START A PROJECT' : 'JOIN MADE'}
              </Button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 'var(--space-8)',
            }}
          >
            {filteredProjects.map((project) => {
              const statusVariant =
                project.status === 'LIVE'
                  ? 'live'
                  : project.status === 'BUILDING'
                  ? 'building'
                  : project.status === 'PROTOTYPE'
                  ? 'prototype'
                  : 'default';

              return (
                <div
                  key={project.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-technical)',
                    borderRadius: 'var(--radius-xs)',
                    padding: 'var(--space-6)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Status & Category */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-3)',
                      }}
                    >
                      <Badge variant={statusVariant} useBrackets>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          color: 'var(--text-dim)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {project.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.375rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-2)',
                      }}
                    >
                      <Link
                        href={`/projects/${project.slug}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {project.title}
                      </Link>
                    </h3>

                    {/* Short Description */}
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        marginBottom: 'var(--space-4)',
                      }}
                    >
                      {project.short_description}
                    </p>

                    {/* Technology Stack Chips */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                          marginBottom: 'var(--space-6)',
                        }}
                      >
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.625rem',
                              padding: '2px 6px',
                              backgroundColor: 'var(--bg-canvas)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-none)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Owner Meta & Action */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: 'var(--space-4)',
                      marginTop: 'var(--space-2)',
                    }}
                  >
                    <div>
                      {project.owner && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: 'var(--text-dim)',
                          }}
                        >
                          BY{' '}
                          <Link
                            href={`/builders/${project.owner.username}`}
                            style={{
                              color: 'var(--text-primary)',
                              textDecoration: 'underline',
                            }}
                          >
                            @{project.owner.username}
                          </Link>
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/projects/${project.slug}`}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--accent-primary-hover)',
                        textDecoration: 'none',
                      }}
                    >
                      VIEW BUILD →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
