import React from 'react';
import Link from 'next/link';
import { requireSuperAdmin, isSuperAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/lib/supabase/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BuilderRoleSelect } from './BuilderRoleSelect';

export default async function AdminBuildersPage() {
  const currentAdminProfile = await requireSuperAdmin();
  const supabase = createClient();
  const canManageRoles = isSuperAdmin(currentAdminProfile);

  let builders: Profile[] = [];
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username, email, role, onboarding_completed, primary_focus, location, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (data) {
      builders = data as Profile[];
    }
  } catch {
    builders = [];
  }

  return (
    <div>
      {/* Masthead */}
      <div style={{ marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)' }}>
        <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
          MEMBERSHIP MATRIX // SUPER ADMIN
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
          Registered Builders
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Directory of registered student engineers, verification status, and assigned system roles.
        </p>
      </div>

      {/* List */}
      {builders.length === 0 ? (
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
            NO REGISTERED BUILDERS
          </span>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            No registered builder profiles found in database.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
          {builders.map((builder) => (
            <div
              key={builder.id}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {builder.full_name || 'Anonymous Builder'}
                  </h3>
                  <Badge variant={builder.role === 'SUPER_ADMIN' ? 'accent' : builder.role === 'ADMIN' ? 'building' : 'default'} useBrackets>
                    {builder.role}
                  </Badge>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: builder.onboarding_completed ? 'var(--color-success)' : 'var(--text-dim)',
                    }}
                  >
                    [ {builder.onboarding_completed ? 'ONBOARDED' : 'INCOMPLETE'} ]
                  </span>
                </div>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  HANDLE: {builder.username ? `@${builder.username}` : 'Pending'} // EMAIL: {builder.email || 'Hidden'} // FOCUS: {builder.primary_focus || 'General'} // JOINED: {new Date(builder.created_at).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <BuilderRoleSelect
                  userId={builder.id}
                  currentRole={builder.role}
                  builderName={builder.full_name || builder.username || 'Builder'}
                  isSuperAdmin={canManageRoles}
                />

                {builder.username && builder.onboarding_completed && (
                  <Button href={`/builders/${builder.username}`} variant="outline" size="sm" target="_blank">
                    Public Dossier ↗
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



