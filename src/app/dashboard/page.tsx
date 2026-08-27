import React from 'react';
import Link from 'next/link';
import { requireProfile } from '@/lib/auth/authorization';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { getPublicOpportunities } from '@/lib/opportunities/queries';
import { getUpcomingEvents } from '@/lib/events/queries';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SignOutButton } from './SignOutButton';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

export default async function DashboardPage() {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  // Server-side authentication & profile retrieval with onboarding check
  const profile = await requireProfile();
  const firstName = profile.full_name.split(' ')[0].toUpperCase();

  // Fetch dynamic upcoming opportunities & events from queries
  const opportunities = await getPublicOpportunities();
  const nextOpportunity = opportunities.find((o) => o.status === 'OPEN' || o.status === 'CLOSING_SOON');

  let daysUntilDeadline: number | null = null;
  if (nextOpportunity?.deadline) {
    const diffMs = new Date(nextOpportunity.deadline).getTime() - new Date().getTime();
    daysUntilDeadline = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  const upcomingEvents = await getUpcomingEvents(1);
  const nextEvent = upcomingEvents[0];

  // Compute profile completion percentage
  let completedFields = 2; // id & full_name always exist
  const totalFields = 8;

  if (profile.username) completedFields++;
  if (profile.bio) completedFields++;
  if (profile.primary_focus) completedFields++;
  if (profile.location) completedFields++;
  if (profile.current_build) completedFields++;
  if (profile.github_url || profile.linkedin_url) completedFields++;
  if (profile.avatar_url) completedFields++;

  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-28)' }}>
      <Container>
        {/* Authenticated Workspace Navigation Bar */}
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
              WORKSPACE // {profile.username ? `@${profile.username}` : 'ACTIVE'}
            </span>
            <span style={{ color: 'var(--border-regular)' }}>|</span>
            <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary-hover)', textDecoration: 'underline' }}>
              Overview
            </Link>
            <Link href="/dashboard/projects" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Projects
            </Link>
            <Link href="/dashboard/opportunities" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Opportunities
            </Link>
            <Link href="/dashboard/events" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Events
            </Link>
            <Link href="/profile/edit" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Edit Profile
            </Link>
            <Link href="/settings" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Settings
            </Link>
          </div>

          <SignOutButton />
        </div>

        {/* Welcome Headline & Identity */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span className="technical-label">BUILDER IDENTITY</span>
            <Badge variant={profile.role === 'MEMBER' ? 'default' : 'accent'} useBrackets>
              {profile.role}
            </Badge>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              lineHeight: 0.95,
            }}
          >
            Welcome Back, <br />
            {firstName}.
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 'var(--space-3)' }}>
            Focus: <strong style={{ color: 'var(--text-primary)' }}>{profile.primary_focus || 'Engineering & Building'}</strong> {profile.location ? `// 📍 ${profile.location}` : ''}
          </p>
        </div>

        {/* 2-Column Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
          {/* Current Build Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
            }}
          >
            <div>
              <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
                01 // CURRENT BUILD
              </span>
              {profile.current_build ? (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {profile.current_build}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Active system deployment in progress.
                  </p>
                </div>
              ) : (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    NO CURRENT BUILD
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Your next build belongs here.
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)' }}>
              <Button href="/dashboard/projects/new" variant="primary" size="sm" showArrow>
                Start a Build →
              </Button>
              <Button href="/profile/edit" variant="outline" size="sm">
                Update Status
              </Button>
            </div>
          </div>

          {/* Profile Completion Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="technical-label">02 // PROFILE STRENGTH</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary-hover)' }}>
                  {completionPercentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-none)', margin: 'var(--space-3) 0 var(--space-4)', overflow: 'hidden' }}>
                <div style={{ width: `${completionPercentage}%`, height: '100%', backgroundColor: 'var(--accent-primary)' }} />
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {completionPercentage === 100
                  ? 'Your builder identity is 100% complete and fully searchable in the directory.'
                  : 'Complete your profile to increase collaborator discovery across the MADE network.'}
              </p>
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <Button href="/profile/edit" variant="primary" size="sm" showArrow>
                Edit Profile Details
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Secondary Modules Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)' }}>
          {/* Next Opportunity Deadline */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
                NEXT OPPORTUNITY DEADLINE
              </span>
              {nextOpportunity ? (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {nextOpportunity.title}
                  </h4>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--accent-primary-hover)', marginTop: '4px', fontWeight: 700 }}>
                    {daysUntilDeadline !== null ? `${String(daysUntilDeadline).padStart(2, '0')} DAYS REMAINING` : 'ROLLING APPLICATION'}
                  </p>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
                    [{nextOpportunity.type}] // {nextOpportunity.organization}
                  </span>
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                  No open deadlines pending.
                </p>
              )}
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <Button href="/dashboard/opportunities" variant="outline" size="sm" showArrow>
                Open Application Tracker
              </Button>
            </div>
          </div>

          {/* Next Gathering / Event Countdown */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
                UPCOMING GATHERING
              </span>
              {nextEvent ? (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {nextEvent.title}
                  </h4>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '4px', fontWeight: 700 }}>
                    {new Date(nextEvent.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
                    [{nextEvent.event_type}] // {nextEvent.is_remote ? '🌐 Remote' : nextEvent.location}
                  </span>
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                  The calendar is clear for now.
                </p>
              )}
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <Button href="/dashboard/events" variant="outline" size="sm" showArrow>
                Manage RSVP Schedule
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
