import React from 'react';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/auth/authorization';
import { getPlatformMetrics, getRecentAdminAuditLogs } from '@/lib/admin/audit';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function AdminControlCenterPage() {
  const profile = await requireSuperAdmin();

  const [metrics, auditLogs] = await Promise.all([
    getPlatformMetrics(),
    getRecentAdminAuditLogs(10),
  ]);

  const statCards = [
    { label: 'PUBLIC PROJECTS', value: metrics.publicProjects, sub: `${metrics.totalProjects} total`, href: '/admin/projects' },
    { label: 'ACTIVE BUILDERS', value: metrics.totalBuilders, sub: 'Onboarded profiles', href: '/admin/builders' },
    { label: 'OPEN CAREER ROLES', value: metrics.openCareerRoles, sub: 'Accepting submissions', href: '/admin/careers' },
    { label: 'OPPORTUNITIES', value: metrics.totalOpportunities, sub: 'Published initiatives', href: '/admin/opportunities' },
    { label: 'UPCOMING EVENTS', value: metrics.upcomingEvents, sub: 'Active calendar sessions', href: '/admin/events' },
    { label: 'APPLICATIONS', value: metrics.totalApplications, sub: `${metrics.pendingApplications} pending review`, href: '/admin/applications', alert: metrics.pendingApplications > 0 },
  ];

  return (
    <div>
      {/* Control Center Masthead */}
      <div style={{ marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
              SYSTEM MATRIX // SUPER ADMIN
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
              MADE / Control Center
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              Centralized administrative governance, content creation, and application review for the MADE ecosystem.
            </p>
          </div>

          {/* Quick Action Matrix */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <Button href="/admin/careers/new" variant="primary" size="sm" showArrow>
              + New Career
            </Button>
            <Button href="/admin/opportunities/new" variant="outline" size="sm">
              + New Opportunity
            </Button>
            <Button href="/admin/events/new" variant="outline" size="sm">
              + New Event
            </Button>
            <Button href="/admin/applications" variant="outline" size="sm">
              Review Applications
            </Button>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div style={{ marginBottom: 'var(--space-12)' }}>
        <span className="technical-label" style={{ color: 'var(--text-dim)', display: 'block', marginBottom: 'var(--space-4)' }}>
          01 // PLATFORM INVENTORY & STATUS
        </span>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: card.alert ? '1px solid var(--accent-primary)' : '1px solid var(--border-technical)',
                borderRadius: 'var(--radius-xs)',
                padding: 'var(--space-4) var(--space-5)',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    color: card.alert ? 'var(--accent-primary-hover)' : 'var(--text-muted)',
                    fontWeight: 700,
                    display: 'block',
                    textTransform: 'uppercase',
                  }}
                >
                  {card.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    display: 'block',
                    margin: 'var(--space-1) 0',
                  }}
                >
                  {card.value}
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-dim)',
                }}
              >
                {card.sub}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Administrative Activity & Audit Logs */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <span className="technical-label" style={{ color: 'var(--text-dim)' }}>
            02 // RECENT ADMINISTRATIVE AUDIT LOGS
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
            AUTO-LOGGED
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-12) var(--space-6)',
              textAlign: 'center',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
              AUDIT TRAIL CLEAN
            </span>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              No administrative actions logged yet. Platform activities will appear here in chronological sequence.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-4) 0',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.8125rem',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Badge variant="accent" useBrackets>
                    {log.entity_type}
                  </Badge>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {log.action}
                  </span>
                  {log.metadata?.title && (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      &ldquo;{log.metadata.title}&rdquo;
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                    BY {log.admin?.username ? `@${log.admin.username}` : 'ADMIN'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
