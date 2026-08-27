import React from 'react';
import { requireAdmin } from '@/lib/auth/authorization';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { siteConfig } from '@/config/site';
import { Badge } from '@/components/ui/Badge';

export default async function AdminSettingsPage() {
  const profile = await requireAdmin();
  const { url, isConfigured } = getSupabaseEnv();

  return (
    <div>
      {/* Masthead */}
      <div style={{ marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)' }}>
        <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
          SYSTEM PARAMETERS // GOVERNANCE
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
          Control Center Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Review site configuration, authorized administrative identity, and platform runtime status.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {/* Section 1: Super Admin Account */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <span className="technical-label" style={{ color: 'var(--text-dim)' }}>
              01 // ACTIVE SUPER ADMIN IDENTITY
            </span>
            <Badge variant="accent" useBrackets>
              {profile.role}
            </Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>FULL NAME</span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{profile.full_name}</p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>REGISTERED EMAIL</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                {profile.email || 'Supabase Auth User'}
              </p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>BUILDER HANDLE</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                {profile.username ? `@${profile.username}` : 'Unclaimed'}
              </p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>SECURITY ACCESS LEVEL</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--accent-primary-hover)', marginTop: '2px', fontWeight: 700 }}>
                FULL PLATFORM CONTROL (LEVEL 0)
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Platform Status & Supabase */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-6)',
          }}
        >
          <span className="technical-label" style={{ color: 'var(--text-dim)', display: 'block', marginBottom: 'var(--space-4)' }}>
            02 // PLATFORM RUNTIME & INFRASTRUCTURE
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>SUPABASE ENDPOINT</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px', wordBreak: 'break-all' }}>
                {url}
              </p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>CONNECTIVITY STATUS</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: isConfigured ? 'var(--color-success)' : 'var(--color-danger)', marginTop: '2px', fontWeight: 700 }}>
                {isConfigured ? '● OPERATIONAL (ACTIVE SESSION)' : '○ DISCONNECTED'}
              </p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>AUTHENTICATION PROVIDER</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                Supabase Auth + SSR Cookies
              </p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>ROW LEVEL SECURITY (RLS)</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-success)', marginTop: '2px', fontWeight: 700 }}>
                ENFORCED ON ALL TABLES
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Founder & Governance Configuration */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-6)',
          }}
        >
          <span className="technical-label" style={{ color: 'var(--text-dim)', display: 'block', marginBottom: 'var(--space-4)' }}>
            03 // AUTHORITATIVE FOUNDER IDENTITY & BUILT BY
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>FOUNDER & PRESIDENT</span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{siteConfig.founder.name}</p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>OFFICIAL TITLE</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                {siteConfig.founder.title}
              </p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>FOUNDER IMAGE ASSET</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--accent-primary-hover)', marginTop: '2px' }}>
                {siteConfig.founder.image}
              </p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>CONFIG SOURCE</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                src/config/site.ts (Protected)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
