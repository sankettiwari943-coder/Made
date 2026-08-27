'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/editorial/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface BuilderItem {
  id: string;
  name: string;
  username: string;
  role: string;
  primaryFocus: string;
  currentBuild: string | null;
  skills: string[];
  avatarUrl: string | null;
}

const DISCIPLINES = [
  'All',
  'Engineering',
  'AI / ML',
  'Design',
  'Cybersecurity',
  'Web & Cloud',
  'Systems & Compilers',
  'Research',
];

export default function BuildersDirectoryPage() {
  const { isConfigured } = getSupabaseEnv();

  const [builders, setBuilders] = useState<BuilderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const fetchBuilders = async () => {
      try {
        const supabase = createClient();
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, role, primary_focus, current_build, avatar_url, onboarding_completed')
          .eq('onboarding_completed', true)
          .order('created_at', { ascending: false });

        if (error || !profiles || profiles.length === 0) {
          setBuilders([]);
          setIsLoading(false);
          return;
        }

        const profileIds = profiles.map((p) => p.id);
        const { data: skillsData } = await supabase
          .from('profile_skills')
          .select('profile_id, skill')
          .in('profile_id', profileIds);

        const skillsMap: Record<string, string[]> = {};
        if (skillsData) {
          skillsData.forEach((s) => {
            if (!skillsMap[s.profile_id]) skillsMap[s.profile_id] = [];
            skillsMap[s.profile_id].push(s.skill);
          });
        }

        const liveBuilders: BuilderItem[] = profiles
          .filter((p) => p.username)
          .map((p) => ({
            id: p.id,
            name: p.full_name,
            username: p.username as string,
            role: p.role,
            primaryFocus: p.primary_focus || 'Engineering',
            currentBuild: p.current_build || null,
            skills: skillsMap[p.id] || [],
            avatarUrl: p.avatar_url || null,
          }));

        setBuilders(liveBuilders);
      } catch {
        setBuilders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilders();
  }, [isConfigured]);

  const filteredBuilders = useMemo(() => {
    return builders.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.primaryFocus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDiscipline =
        selectedDiscipline === 'All' ||
        b.primaryFocus.toLowerCase().includes(selectedDiscipline.toLowerCase());

      return matchesSearch && matchesDiscipline;
    });
  }, [builders, searchTerm, selectedDiscipline]);

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-28)' }}>
      <Container>
        {/* Section Heading */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <SectionHeading
            index="DIRECTORY"
            label="BUILDERS / 2026"
            title="Who's Making It?"
            description="The engineers, researchers, designers, and operators learning by building real systems across the MADE network."
          />
        </div>

        {/* Filter Bar */}
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
              placeholder="Search by builder name, handle (@username), focus, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Discipline Filters */}
          <div>
            <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              CORE DISCIPLINE
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {DISCIPLINES.map((disc) => {
                const isSelected = selectedDiscipline === disc;
                return (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => setSelectedDiscipline(disc)}
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
                    {disc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Builders Stream / Intentional Empty State */}
        {isLoading ? (
          <div style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
            <span className="technical-label">LOADING BUILDER DIRECTORY...</span>
          </div>
        ) : filteredBuilders.length === 0 ? (
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
              BUILDERS / 2026
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
              The Builder Directory is Just Opening.
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
              No profiles have been published yet.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
              <Button href="/signup" variant="primary" size="lg" showArrow>
                CREATE YOUR PROFILE
              </Button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'var(--space-8)',
            }}
          >
            {filteredBuilders.map((builder) => (
              <div
                key={builder.id}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                    <Badge variant={builder.role === 'MEMBER' ? 'default' : 'accent'} useBrackets>
                      {builder.role}
                    </Badge>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                      FOCUS // {builder.primaryFocus}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.375rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Link href={`/builders/${builder.username}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {builder.name}
                    </Link>
                  </h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary-hover)', display: 'block', marginTop: '2px' }}>
                    @{builder.username}
                  </span>

                  {builder.currentBuild && (
                    <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>
                        CURRENT BUILD
                      </span>
                      <strong style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>
                        {builder.currentBuild}
                      </strong>
                    </div>
                  )}

                  {builder.skills && builder.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'var(--space-4)' }}>
                      {builder.skills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.625rem',
                            padding: '2px 6px',
                            backgroundColor: 'var(--bg-canvas)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Link
                    href={`/builders/${builder.username}`}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--accent-primary-hover)',
                      textDecoration: 'none',
                    }}
                  >
                    VIEW PROFILE →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
