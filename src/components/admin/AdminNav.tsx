'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';

interface AdminNavProps {
  adminRole?: string;
  adminName?: string;
}

export const AdminNav: React.FC<AdminNavProps> = ({ adminRole = 'SUPER_ADMIN', adminName }) => {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  interface NavItem {
    label: string;
    href: string;
    exact?: boolean;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [{ label: 'Control Center', href: '/admin', exact: true }],
    },
    {
      title: 'CONTENT',
      items: [
        { label: 'Projects', href: '/admin/projects' },
        { label: 'Opportunities', href: '/admin/opportunities' },
        { label: 'Events', href: '/admin/events' },
        { label: 'Careers', href: '/admin/careers' },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        { label: 'Builders', href: '/admin/builders' },
        { label: 'Applications', href: '/admin/applications' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [{ label: 'Settings', href: '/admin/settings' }],
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-technical)',
        borderRadius: 'var(--radius-xs)',
        padding: 'var(--space-6)',
      }}
    >
      {/* Admin Identity Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
          <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
            CONTROL CENTER
          </span>
          <Badge variant="accent" useBrackets>
            {adminRole}
          </Badge>
        </div>
        {adminName && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            {adminName}
          </span>
        )}
      </div>

      {/* Nav Sections */}
      {navSections.map((section) => (
        <div key={section.title}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              letterSpacing: '0.1em',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 'var(--space-2)',
            }}
          >
            {section.title}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {section.items.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-xs)',
                    textDecoration: 'none',
                    backgroundColor: active ? 'var(--text-primary)' : 'transparent',
                    color: active ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                    fontWeight: active ? 700 : 400,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {active ? `→ ${item.label}` : item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Secondary System Escape */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Link
          href="/dashboard"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--text-muted)',
            textDecoration: 'underline',
          }}
        >
          ← User Workspace
        </Link>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--text-muted)',
            textDecoration: 'underline',
          }}
        >
          ← Public Homepage
        </Link>
      </div>
    </div>
  );
};
