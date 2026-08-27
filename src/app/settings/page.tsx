'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { Container } from '@/components/layout/Container';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

export default function SettingsPage() {
  const router = useRouter();
  const { isConfigured } = getSupabaseEnv();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string>('MEMBER');
  const [isLoading, setIsLoading] = useState(true);

  // Security Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const loadUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?next=/settings');
        return;
      }

      setUserEmail(user.email || 'Registered User');
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUsername(profile.username);
        setRole(profile.role);
      }

      setIsLoading(false);
    };

    loadUserData();
  }, [isConfigured, router]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="technical-label">LOADING SETTINGS...</span>
      </div>
    );
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordStatus('saving');
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message);
        setPasswordStatus('error');
      } else {
        setPasswordStatus('saved');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordStatus('idle'), 4000);
      }
    } catch {
      setPasswordError('Network error while updating password.');
      setPasswordStatus('error');
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-28)' }}>
      <Container size="narrow">
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/dashboard" className="technical-label" style={{ color: 'var(--text-muted)' }}>
              WORKSPACE
            </Link>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">SETTINGS</span>
          </div>

          <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
          {/* Header */}
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Account & Security Settings
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Manage your authenticated credentials, security parameters, and workspace session.
            </p>
          </div>

          {/* Section 1: Account Information */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6) var(--space-8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <span className="technical-label">01 // ACCOUNT IDENTIFIERS</span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Primary Email
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {userEmail}
                </p>
              </div>

              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Public Handle
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {username ? `@${username}` : 'Unset'}
                </p>
              </div>

              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Role Level
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--accent-primary-hover)', marginTop: '2px', fontWeight: 700 }}>
                  [ {role} ]
                </p>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-2)', borderTop: '1px solid var(--border-technical)', paddingTop: 'var(--space-4)' }}>
              <Button href="/profile/edit" variant="outline" size="sm" showArrow>
                Edit Public Profile
              </Button>
            </div>
          </div>

          {/* Section 2: Security & Password */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6) var(--space-8)',
            }}
          >
            <span className="technical-label">02 // SECURITY & PASSWORD</span>

            {passwordStatus === 'saved' && (
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--color-success)',
                  borderRadius: 'var(--radius-xs)',
                  padding: 'var(--space-3)',
                  margin: 'var(--space-4) 0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-success)',
                }}
              >
                [ SUCCESS ]: PASSWORD UPDATED SUCCESSFULLY
              </div>
            )}

            {passwordError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--color-danger)',
                  borderRadius: 'var(--radius-xs)',
                  padding: 'var(--space-3)',
                  margin: 'var(--space-4) 0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-danger)',
                }}
              >
                [ ERROR ]: {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                variant="outline"
                size="md"
                style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
                disabled={passwordStatus === 'saving'}
              >
                {passwordStatus === 'saving' ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </Button>
            </form>
          </div>

          {/* Section 3: Session Termination */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6) var(--space-8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
            }}
          >
            <div>
              <span className="technical-label">03 // ACTIVE SESSION</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Terminate your current authenticated workspace session on this device.
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={handleSignOut}>
              SIGN OUT
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
