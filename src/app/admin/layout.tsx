import React from 'react';
import { redirect } from 'next/navigation';
import { getSuperAdminAuth } from '@/lib/auth/authorization';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { Container } from '@/components/layout/Container';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

export const metadata = {
  title: 'MADE Control Center // Super Admin',
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

  // 1. Server-side strict authorization check: SUPER_ADMIN role only
  const { isSuperAdmin, user, profile } = await getSuperAdminAuth();

  // If visitor is unauthenticated, redirect to login with return path
  if (!user) {
    redirect('/login?next=/admin');
  }

  // 2. If authenticated user is NOT SUPER_ADMIN, return Access Denied
  // Do NOT render AdminNav, and do NOT render children (preventing any admin data execution)
  if (!isSuperAdmin) {
    return <AdminAccessDenied user={user} profile={profile} />;
  }

  const adminName =
    profile?.full_name ||
    (user.email?.toLowerCase().includes('apurva')
      ? 'Apurva Diwedi'
      : user.email?.toLowerCase().includes('sanket')
      ? 'Sanket Tiwari'
      : user.email?.split('@')[0]);

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
            <AdminNav adminRole="SUPER_ADMIN" adminName={adminName} />
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

