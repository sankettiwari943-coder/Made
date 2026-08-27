import React from 'react';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { Opportunity } from '@/lib/supabase/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function AdminOpportunitiesPage() {
  await requireSuperAdmin();

  const supabase = createClient();

  let opportunities: Opportunity[] = [];
  try {
    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      opportunities = data as Opportunity[];
    }
  } catch {
    opportunities = [];
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
            OPPORTUNITY MATRIX // 2026
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
            Manage Opportunities
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Curate hackathons, grants, fellowships, and internships for the builder directory.
          </p>
        </div>

        <Button href="/admin/opportunities/new" variant="primary" size="sm" showArrow>
          + Create Opportunity
        </Button>
      </div>

      {/* List */}
      {opportunities.length === 0 ? (
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
            OPPORTUNITY BOARD IS CLEAR
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
            No Opportunities Published.
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: 'var(--space-3) auto var(--space-6)' }}>
            Publish the first opportunity when there&apos;s something worth sharing.
          </p>
          <Button href="/admin/opportunities/new" variant="primary" size="md" showArrow>
            Create Opportunity
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
          {opportunities.map((opp) => (
            <div
              key={opp.id}
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
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {opp.title}
                  </h3>
                  <Badge variant="accent" useBrackets>
                    {opp.type}
                  </Badge>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: opp.is_published ? 'var(--color-success)' : 'var(--text-dim)',
                    }}
                  >
                    [ {opp.is_published ? 'PUBLISHED' : 'DRAFT'} ]
                  </span>
                </div>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  ORG: {opp.organization} // {opp.is_remote ? '🌐 Remote' : opp.location || 'In-Person'} // DEADLINE: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'} // UPDATED: {new Date(opp.updated_at).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Button href={`/opportunities/${opp.slug}`} variant="outline" size="sm" target="_blank">
                  View Public ↗
                </Button>
                <Button href={`/admin/opportunities/${opp.id}/edit`} variant="primary" size="sm">
                  Edit Opportunity
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
