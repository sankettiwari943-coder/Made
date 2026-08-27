'use client';

import React, { useState, useTransition } from 'react';
import { UserRole } from '@/lib/supabase/types';
import { updateBuilderRoleAction } from '@/lib/admin/actions';

interface BuilderRoleSelectProps {
  userId: string;
  currentRole: UserRole;
  builderName: string;
}

export function BuilderRoleSelect({ userId, currentRole, builderName }: BuilderRoleSelectProps) {
  const [role, setRole] = useState<UserRole>(currentRole);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    if (newRole === role) return;

    const confirmed = window.confirm(
      `Are you sure you want to change the role of "${builderName}" to [${newRole}]?`
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await updateBuilderRoleAction(userId, newRole, builderName);
        setRole(newRole);
        setMessage('Role updated');
        setTimeout(() => setMessage(null), 3000);
      } catch (err: any) {
        alert(err.message || 'Failed to update role');
      }
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <select
        value={role}
        disabled={isPending}
        onChange={handleChange}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '4px 8px',
          backgroundColor: 'var(--bg-canvas)',
          color: role === 'SUPER_ADMIN' ? 'var(--accent-primary-hover)' : 'var(--text-primary)',
          border: '1px solid var(--border-technical)',
          borderRadius: 'var(--radius-xs)',
          cursor: isPending ? 'wait' : 'pointer',
          outline: 'none',
        }}
      >
        <option value="MEMBER">MEMBER</option>
        <option value="ADMIN">ADMIN</option>
        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
      </select>
      {message && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--color-success)',
          }}
        >
          ✓ {message}
        </span>
      )}
    </div>
  );
}
