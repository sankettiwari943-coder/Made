'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProjectWithDetails } from '@/lib/supabase/types';
import { moderateProjectVisibilityAction } from '@/lib/admin/actions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AdminProjectsClient({ initialProjects }: { initialProjects: ProjectWithDetails[] }) {
  const [projects, setProjects] = useState<ProjectWithDetails[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleVisibility = async (project: ProjectWithDetails) => {
    setActionLoading(project.id);
    const nextVisibility = !project.is_public;

    try {
      await moderateProjectVisibilityAction(project.id, nextVisibility, project.title);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, is_public: nextVisibility } : p))
      );
    } catch (err) {
      alert('Failed to update project visibility.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.owner?.full_name && p.owner.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.owner?.username && p.owner.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesVisibility =
      filterVisibility === 'ALL' ||
      (filterVisibility === 'PUBLIC' && p.is_public) ||
      (filterVisibility === 'PRIVATE' && !p.is_public);

    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;

    return matchesSearch && matchesVisibility && matchesStatus;
  });

  return (
    <div>
      {/* Masthead */}
      <div style={{ marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)' }}>
        <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
          PROJECT MODERATION & GOVERNANCE
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1,
            marginTop: 'var(--space-2)',
          }}
        >
          Manage Projects
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Audit workspace builds, moderate public visibility, and review repository links.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          alignItems: 'end',
        }}
      >
        <Input
          label="Search Projects / Builders"
          placeholder="Filter by title, slug, or owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div>
          <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
            VISIBILITY
          </label>
          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value as any)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-technical)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            <option value="ALL">All Visibilities</option>
            <option value="PUBLIC">Public Directory Only</option>
            <option value="PRIVATE">Private Builds Only</option>
          </select>
        </div>

        <div>
          <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
            STATUS
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-technical)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="BUILDING">BUILDING</option>
            <option value="PROTOTYPE">PROTOTYPE</option>
            <option value="LIVE">LIVE</option>
            <option value="OPEN_SOURCE">OPEN SOURCE</option>
            <option value="IDEA">IDEA</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      {filteredProjects.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-16) var(--space-8)',
            textAlign: 'center',
          }}
        >
          <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
            NO PROJECTS MATCHING FILTERS
          </span>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            No registered projects match your search criteria.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-6) 0',
                borderBottom: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {p.title}
                  </h3>
                  <Badge variant={p.status === 'LIVE' ? 'live' : p.status === 'BUILDING' ? 'building' : 'default'} useBrackets>
                    {p.status}
                  </Badge>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: p.is_public ? 'var(--color-success)' : 'var(--text-dim)',
                    }}
                  >
                    [ {p.is_public ? 'PUBLIC' : 'PRIVATE'} ]
                  </span>
                </div>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  OWNER: {p.owner?.full_name || 'Builder'} ({p.owner?.username ? `@${p.owner.username}` : 'No handle'}) // CATEGORY: {p.category} // CREATED: {new Date(p.created_at).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {p.is_public && (
                  <Button href={`/projects/${p.slug}`} variant="outline" size="sm" target="_blank">
                    View Public ↗
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionLoading === p.id}
                  onClick={() => handleToggleVisibility(p)}
                >
                  {p.is_public ? 'Make Private' : 'Make Public'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
