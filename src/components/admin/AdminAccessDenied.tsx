import React from 'react';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Profile } from '@/lib/supabase/types';

interface AdminAccessDeniedProps {
  user: any;
  profile: Profile | null;
}

export function AdminAccessDenied({ user, profile }: AdminAccessDeniedProps) {
  const userEmail = user?.email || profile?.email || 'Authenticated User';
  const userRole = profile?.role || 'MEMBER';

  return (
    <div
      style={{
        padding: 'var(--space-20) 0 var(--space-28)',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container size="narrow">
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-8) var(--space-8)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Security Line Indicator */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: 'var(--color-danger, #ef4444)',
            }}
          />

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <span
              className="technical-label"
              style={{
                color: 'var(--color-danger, #ef4444)',
                display: 'block',
                marginBottom: 'var(--space-3)',
              }}
            >
              [ 403 FORBIDDEN // ACCESS RESTRICTED ]
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                lineHeight: 1.05,
              }}
            >
              Super Admin Clearance Required
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginTop: 'var(--space-4)',
                lineHeight: 1.6,
              }}
            >
              Access to the MADE Super Admin Control Center (<code style={{ color: 'var(--accent-primary)' }}>/admin</code>)
              and administrative management APIs is strictly restricted to accounts provisioned with the <strong style={{ color: 'var(--text-primary)' }}>SUPER_ADMIN</strong> role.
            </p>
          </div>

          {/* Account Diagnostics Matrix */}
          <div
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-5)',
              marginBottom: 'var(--space-8)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-dim)',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                AUTHENTICATED ACCOUNT
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  wordBreak: 'break-all',
                }}
              >
                {userEmail}
              </p>
            </div>

            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-dim)',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                CURRENT ASSIGNED ROLE
              </span>
              <Badge variant="default" useBrackets>
                {userRole}
              </Badge>
            </div>

            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-dim)',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                REQUIRED CLEARANCE
              </span>
              <Badge variant="accent" useBrackets>
                SUPER_ADMIN
              </Badge>
            </div>

            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-dim)',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                SECURITY CLEARANCE
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-danger, #ef4444)',
                }}
              >
                DENIED // LEVEL 0 ONLY
              </span>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 'var(--space-6)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <Button href="/dashboard" variant="primary" size="md" showArrow>
                Return to Dashboard
              </Button>
              <Button href="/" variant="outline" size="md">
                Platform Home
              </Button>
            </div>

            <form action="/auth/signout" method="POST" style={{ margin: 0 }}>
              <button
                type="submit"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '8px 0',
                }}
              >
                Switch Account →
              </button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
