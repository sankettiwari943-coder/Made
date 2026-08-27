import React from 'react';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { CareerRole } from '@/lib/supabase/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function AdminCareersPage() {
  await requireSuperAdmin();

  const supabase = createClient();

  let roles: (CareerRole & { applicationsCount?: number })[] = [];
  try {
    const { data: roleRows } = await supabase
      .from('career_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (roleRows && roleRows.length > 0) {
      // Fetch application counts
      const roleIds = roleRows.map((r) => r.id);
      const { data: appCounts } = await supabase
        .from('career_applications')
        .select('role_id')
        .in('role_id', roleIds);

      const countMap: Record<string, number> = {};
      if (appCounts) {
        appCounts.forEach((a) => {
          countMap[a.role_id] = (countMap[a.role_id] || 0) + 1;
        });
      }

      roles = roleRows.map((r) => ({
        ...(r as CareerRole),
        applicationsCount: countMap[r.id] || 0,
      }));
    }
  } catch {
    roles = [];
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
            CAREER INVENTORY // 2026
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
            Manage Career Roles
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Create open positions, publish drafts, update deadlines, and inspect candidate submissions.
          </p>
        </div>

        <Button href="/admin/careers/new" variant="primary" size="sm" showArrow>
          + Create New Role
        </Button>
      </div>

      {/* Roles List */}
      {roles.length === 0 ? (
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
            NO OPEN ROLES
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
            No Career Roles Created.
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: 'var(--space-3) auto var(--space-6)' }}>
            Create a role when you&apos;re ready to invite someone in.
          </p>
          <Button href="/admin/careers/new" variant="primary" size="md" showArrow>
            Create New Role
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
          {roles.map((role) => (
            <div
              key={role.id}
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
                    {role.title}
                  </h3>
                  <Badge variant={role.status === 'OPEN' ? 'live' : role.status === 'PAUSED' ? 'building' : 'default'} useBrackets>
                    {role.status}
                  </Badge>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: role.is_published ? 'var(--color-success)' : 'var(--text-dim)',
                    }}
                  >
                    [ {role.is_published ? 'PUBLISHED' : 'DRAFT'} ]
                  </span>
                </div>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  DEPT: {role.department} // {role.is_remote ? '🌐 Remote' : role.location || 'Hybrid'} // DEADLINE: {role.deadline ? new Date(role.deadline).toLocaleDateString() : 'Rolling'} // APPS: {role.applicationsCount}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Button href={`/careers/${role.slug}`} variant="outline" size="sm" target="_blank">
                  View Public ↗
                </Button>
                <Button href={`/admin/applications?roleId=${role.id}`} variant="outline" size="sm">
                  Applications ({role.applicationsCount})
                </Button>
                <Button href={`/admin/careers/${role.id}/edit`} variant="primary" size="sm">
                  Edit Role
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
