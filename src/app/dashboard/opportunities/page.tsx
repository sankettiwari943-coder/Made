'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { Opportunity, OpportunityAppStatus } from '@/lib/supabase/types';
import { calculateOpportunityStatus } from '@/lib/opportunities/validations';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

interface TrackedItem {
  id: string;
  status: OpportunityAppStatus;
  opp: Opportunity;
}

export default function DashboardOpportunitiesPage() {
  const router = useRouter();
  const { isConfigured } = getSupabaseEnv();

  const [savedOpps, setSavedOpps] = useState<Opportunity[]>([]);
  const [trackerItems, setTrackerItems] = useState<TrackedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'tracker' | 'saved'>('tracker');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?next=/dashboard/opportunities');
        return;
      }

      setUserId(user.id);

      // 1. Fetch saved
      const { data: savedData } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id, opportunities(*)')
        .eq('user_id', user.id);

      if (savedData && savedData.length > 0) {
        const opps = savedData
          .map((s: any) => s.opportunities)
          .filter(Boolean)
          .map((o: Opportunity) => ({
            ...o,
            status: calculateOpportunityStatus(o.deadline),
          }));
        setSavedOpps(opps);
      } else {
        setSavedOpps([]);
      }

      // 2. Fetch tracker
      const { data: trackerData } = await supabase
        .from('opportunity_applications')
        .select('id, status, opportunities(*)')
        .eq('user_id', user.id);

      if (trackerData && trackerData.length > 0) {
        const items = trackerData
          .filter((t: any) => Boolean(t.opportunities))
          .map((t: any) => ({
            id: t.id,
            status: t.status as OpportunityAppStatus,
            opp: {
              ...t.opportunities,
              status: calculateOpportunityStatus(t.opportunities.deadline),
            },
          }));
        setTrackerItems(items);
      } else {
        setTrackerItems([]);
      }

      setIsLoading(false);
    };

    loadData();
  }, [isConfigured, router]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="technical-label">LOADING OPPORTUNITY WORKSPACE...</span>
      </div>
    );
  }

  const handleUpdateStatus = async (trackingId: string, newStatus: OpportunityAppStatus) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('opportunity_applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', trackingId)
      .eq('user_id', userId);

    if (!error) {
      setTrackerItems((prev) =>
        prev.map((t) => (t.id === trackingId ? { ...t, status: newStatus } : t))
      );
    }
  };

  const handleRemoveSaved = async (oppId: string) => {
    if (!userId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('saved_opportunities')
      .delete()
      .eq('opportunity_id', oppId)
      .eq('user_id', userId);

    if (!error) {
      setSavedOpps((prev) => prev.filter((o) => o.id !== oppId));
    }
  };

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-28)' }}>
      <Container>
        {/* Workspace Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-8)',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 'var(--space-4)',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              WORKSPACE
            </span>
            <span style={{ color: 'var(--border-regular)' }}>|</span>
            <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Overview
            </Link>
            <Link href="/dashboard/projects" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Projects
            </Link>
            <Link href="/dashboard/opportunities" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary-hover)', textDecoration: 'underline' }}>
              Opportunities
            </Link>
            <Link href="/dashboard/events" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Events
            </Link>
            <Link href="/dashboard/applications" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Applications
            </Link>
          </div>

          <Button href="/opportunities" variant="primary" size="sm" showArrow>
            Explore All Opportunities
          </Button>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
            CAREER & INITIATIVE SUBSTRATE
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginTop: 'var(--space-2)',
            }}
          >
            Track Opportunities
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Personal application tracker and saved bookmarks. Your records are completely private to your account.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 'var(--space-8)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              padding: 'var(--space-3) var(--space-4)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'tracker' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'tracker' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            APPLICATION TRACKER ({trackerItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              padding: 'var(--space-3) var(--space-4)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'saved' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'saved' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            SAVED BOOKMARKS ({savedOpps.length})
          </button>
        </div>

        {/* Tab 1: Application Tracker */}
        {activeTab === 'tracker' && (
          <div>
            {trackerItems.length === 0 ? (
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
                  APPLICATION TRACKER
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
                  No Active Tracked Applications.
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
                  Track hackathons, fellowships, and grants you&apos;re preparing or submitted.
                </p>
                <Button href="/opportunities" variant="primary" size="md" showArrow>
                  EXPLORE OPPORTUNITIES
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
                {trackerItems.map((item) => (
                  <div
                    key={item.id}
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
                          <Link href={`/opportunities/${item.opp.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {item.opp.title}
                          </Link>
                        </h3>
                        <Badge variant="accent" useBrackets>
                          {item.status}
                        </Badge>
                      </div>

                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                        ORGANIZATION: {item.opp.organization} // DEADLINE: {item.opp.deadline ? new Date(item.opp.deadline).toLocaleDateString() : 'Rolling'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {(['INTERESTED', 'APPLIED', 'COMPLETED', 'DISMISSED'] as OpportunityAppStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, st)}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.625rem',
                            padding: '3px 8px',
                            backgroundColor: item.status === st ? 'var(--text-primary)' : 'var(--bg-surface)',
                            color: item.status === st ? 'var(--bg-canvas)' : 'var(--text-muted)',
                            border: item.status === st ? '1px solid var(--text-primary)' : '1px solid var(--border-technical)',
                            borderRadius: 'var(--radius-xs)',
                            cursor: 'pointer',
                            fontWeight: item.status === st ? 700 : 400,
                          }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Bookmarks */}
        {activeTab === 'saved' && (
          <div>
            {savedOpps.length === 0 ? (
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
                  SAVED
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
                  Nothing Saved Yet.
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
                  Find something worth building toward.
                </p>
                <Button href="/opportunities" variant="primary" size="md" showArrow>
                  EXPLORE OPPORTUNITIES
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
                {savedOpps.map((opp) => (
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
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                          <Link href={`/opportunities/${opp.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {opp.title}
                          </Link>
                        </h3>
                        <Badge variant="live" useBrackets>
                          {opp.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                        ORGANIZATION: {opp.organization} // DEADLINE: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <Button href={`/opportunities/${opp.slug}`} variant="outline" size="sm">
                        View Opportunity
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSaved(opp.id)}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: 'var(--color-danger)',
                          background: 'none',
                          border: 'none',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
