'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { Opportunity, OpportunityType } from '@/lib/supabase/types';
import { calculateOpportunityStatus, OPPORTUNITY_TYPES } from '@/lib/opportunities/validations';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/editorial/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function OpportunitiesDirectoryPage() {
  const { isConfigured } = getSupabaseEnv();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<'ALL' | 'REMOTE' | 'IN_PERSON'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'deadline' | 'newest'>('deadline');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const fetchOpportunities = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('is_published', true)
          .order('deadline', { ascending: true, nullsFirst: false });

        if (error || !data || data.length === 0) {
          setOpportunities([]);
          setIsLoading(false);
          return;
        }

        const calculated: Opportunity[] = data.map((opp: Opportunity) => ({
          ...opp,
          status: calculateOpportunityStatus(opp.deadline),
        }));

        setOpportunities(calculated);
      } catch {
        setOpportunities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, [isConfigured]);

  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        const matchesSearch =
          opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.short_description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = selectedType === 'ALL' || opp.type === selectedType;

        const matchesFormat =
          selectedFormat === 'ALL' ||
          (selectedFormat === 'REMOTE' && opp.is_remote) ||
          (selectedFormat === 'IN_PERSON' && !opp.is_remote);

        const matchesStatus =
          selectedStatus === 'ALL' || opp.status === selectedStatus;

        return matchesSearch && matchesType && matchesFormat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  }, [opportunities, searchTerm, selectedType, selectedFormat, selectedStatus, sortBy]);

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-28)' }}>
      <Container>
        {/* Section Heading */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <SectionHeading
            index="DIRECTORY"
            label="OPPORTUNITIES / 2026"
            title="Places Worth Building Toward"
            description="A curated registry of student hackathons, fellowships, grants, competitions, and technical programs."
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
          {/* Search & Sort Row */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: '1', minWidth: '280px', maxWidth: '480px' }}>
              <Input
                type="search"
                placeholder="Search by title, organization, or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Sort Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="technical-label">SORT BY:</span>
              <button
                type="button"
                onClick={() => setSortBy('deadline')}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  padding: '4px 8px',
                  backgroundColor: sortBy === 'deadline' ? 'var(--text-primary)' : 'var(--bg-canvas)',
                  color: sortBy === 'deadline' ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                  border: sortBy === 'deadline' ? '1px solid var(--text-primary)' : '1px solid var(--border-technical)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  fontWeight: sortBy === 'deadline' ? 700 : 400,
                }}
              >
                DEADLINE
              </button>
              <button
                type="button"
                onClick={() => setSortBy('newest')}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  padding: '4px 8px',
                  backgroundColor: sortBy === 'newest' ? 'var(--text-primary)' : 'var(--bg-canvas)',
                  color: sortBy === 'newest' ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                  border: sortBy === 'newest' ? '1px solid var(--text-primary)' : '1px solid var(--border-technical)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  fontWeight: sortBy === 'newest' ? 700 : 400,
                }}
              >
                NEWEST
              </button>
            </div>
          </div>

          {/* Type Filter Chips */}
          <div>
            <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              OPPORTUNITY TYPE
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setSelectedType('ALL')}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  padding: '4px 10px',
                  backgroundColor: selectedType === 'ALL' ? 'var(--text-primary)' : 'var(--bg-canvas)',
                  color: selectedType === 'ALL' ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                  border: selectedType === 'ALL' ? '1px solid var(--text-primary)' : '1px solid var(--border-technical)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  fontWeight: selectedType === 'ALL' ? 700 : 500,
                }}
              >
                ALL TYPES
              </button>
              {OPPORTUNITY_TYPES.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
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
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Stream / Intentional Empty State */}
        {isLoading ? (
          <div style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
            <span className="technical-label">LOADING OPPORTUNITY DIRECTORY...</span>
          </div>
        ) : filteredOpportunities.length === 0 ? (
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
              OPPORTUNITIES / 2026
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
              Nothing Open Right Now.
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
              We&apos;re keeping the board clean until there&apos;s something worth applying to.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
              <Button href="/projects" variant="primary" size="lg" showArrow>
                EXPLORE PROJECTS
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
            {filteredOpportunities.map((opp, idx) => {
              const formattedIndex = String(idx + 1).padStart(2, '0');
              const statusVariant =
                opp.status === 'CLOSING_SOON'
                  ? 'building'
                  : opp.status === 'CLOSED'
                  ? 'default'
                  : 'live';

              return (
                <Link
                  key={opp.slug}
                  href={`/opportunities/${opp.slug}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    padding: 'var(--space-6) 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    gap: 'var(--space-3)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {formattedIndex} //
                      </span>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                        {opp.title}
                      </h3>
                      <Badge variant={statusVariant} useBrackets>
                        {opp.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {opp.organization}
                      </span>
                      <span style={{ color: 'var(--border-technical)' }}>//</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        [{opp.type}] {opp.is_remote ? '🌐 REMOTE' : opp.location}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '780px' }}>
                    {opp.short_description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      DEADLINE: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}
                    </span>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary-hover)' }}>
                      VIEW DETAILS →
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
