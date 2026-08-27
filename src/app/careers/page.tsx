'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { CareerRole } from '@/lib/supabase/types';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/editorial/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const DEPARTMENT_FILTERS = [
  'ALL',
  'ENGINEERING',
  'AI_ML',
  'DESIGN',
  'CYBERSECURITY',
  'COMMUNITY',
  'OPERATIONS',
  'RESEARCH',
];

export default function CareersPage() {
  const { isConfigured } = getSupabaseEnv();

  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('career_roles')
          .select('*')
          .eq('is_published', true)
          .eq('status', 'OPEN')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setRoles(data as CareerRole[]);
        } else {
          setRoles([]);
        }
      } catch {
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [isConfigured]);

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      return selectedDept === 'ALL' || r.department === selectedDept;
    });
  }, [roles, selectedDept]);

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-28)' }}>
      <Container>
        {/* Editorial Headline */}
        <div style={{ marginBottom: 'var(--space-16)' }}>
          <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-3)' }}>
            06 // INITIATIVE & CAREERS
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.75rem, 6.5vw, 5rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              lineHeight: 0.95,
              marginBottom: 'var(--space-6)',
            }}
          >
            What will you <br />
            <span style={{ color: 'var(--accent-primary-hover)' }}>make with us?</span>
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              color: 'var(--text-secondary)',
              maxWidth: '820px',
              lineHeight: 1.4,
              fontStyle: 'italic',
            }}
          >
            &ldquo;MADE is a builder collective. We are looking for ambitious student engineers, researchers, designers, and community operators who want to build, contribute, and take real technical ownership.&rdquo;
          </p>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              LOOKING FOR FOUNDER CONTEXT?
            </span>
            <Link
              href="/built-by"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
              }}
            >
              Meet the person behind MADE →
            </Link>
          </div>
        </div>

        {/* Section Heading & Filter */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-12)', marginBottom: 'var(--space-10)' }}>
          <SectionHeading
            index="OPEN ROLES"
            label="CAREERS / 2026"
            title="Available Roles & Fellowships"
            description="All roles are open to undergraduate and graduate students globally."
          />

          {/* Department Filter Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
            {DEPARTMENT_FILTERS.map((dept) => {
              const isSelected = selectedDept === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    padding: '4px 10px',
                    backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-technical)',
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  {dept.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Stream / Intentional Empty State */}
        {isLoading ? (
          <div style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
            <span className="technical-label">LOADING OPEN ROLES...</span>
          </div>
        ) : filteredRoles.length === 0 ? (
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
              CAREERS / 2026
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
              Not Hiring. Still Building.
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
              There are no open roles right now. When there&apos;s something worth building together, this is where it will appear.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
              <Button href="/projects" variant="primary" size="lg" showArrow>
                EXPLORE WHAT WE&apos;RE BUILDING
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
            {filteredRoles.map((role, idx) => {
              const formattedIndex = String(idx + 1).padStart(2, '0');

              return (
                <Link
                  key={role.slug}
                  href={`/careers/${role.slug}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    padding: 'var(--space-8) 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    gap: 'var(--space-4)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {formattedIndex} //
                      </span>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                        {role.title}
                      </h3>
                      <Badge variant="live" useBrackets>
                        OPEN
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {role.department.replace('_', ' ')}
                      </span>
                      <span style={{ color: 'var(--border-technical)' }}>//</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {role.is_remote ? '🌐 REMOTE' : role.location || 'HYBRID'}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '780px' }}>
                    {role.short_description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        COMMITMENT: {role.commitment}
                      </span>
                      {role.deadline && (
                        <>
                          <span style={{ color: 'var(--border-technical)' }}>|</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                            DEADLINE: {new Date(role.deadline).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--accent-primary-hover)',
                      }}
                    >
                      VIEW ROLE →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
