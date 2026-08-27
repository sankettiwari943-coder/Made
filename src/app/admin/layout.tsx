import React from 'react';
import { requireAdmin } from '@/lib/auth/authorization';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { Container } from '@/components/layout/Container';
import { AdminNav } from '@/components/admin/AdminNav';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

export const metadata = {
  title: 'MADE Control Center // Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  // Server-side strict authorization check: SUPER_ADMIN or ADMIN role only
  const profile = await requireAdmin();

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-28)', minHeight: '90vh' }}>
      <Container>
        {/* Responsive 2-Column Administrative Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 240px) 1fr',
            gap: 'var(--space-10)',
            alignItems: 'start',
          }}
        >
          {/* Admin Sidebar Navigation */}
          <aside style={{ position: 'sticky', top: '100px' }}>
            <AdminNav adminRole={profile.role} adminName={profile.full_name} />
          </aside>

          {/* Admin Main Workplace */}
          <main style={{ minWidth: 0 }}>
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}
