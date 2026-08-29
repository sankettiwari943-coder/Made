'use client';

import React, { useState } from 'react';
import { UserRole, Profile } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';

interface BuilderRoleSelectProps {
  userId: string;
  currentRole: UserRole | string;
  builderName: string;
  isSuperAdmin?: boolean;
  currentProfile?: Profile | null;
}

export function BuilderRoleSelect({
  userId,
  currentRole,
  builderName,
  isSuperAdmin: isSuperAdminProp,
  currentProfile,
}: BuilderRoleSelectProps) {
  const [role, setRole] = useState<string>(currentRole || 'builder');
  const [isPending, setIsPending] = useState<boolean>(false);

  // 1. Role Guard: Identify the current logged-in profile role
  const isSuperAdmin =
    currentProfile !== undefined
      ? currentProfile?.role === 'super_admin' || currentProfile?.role === 'SUPER_ADMIN'
      : (isSuperAdminProp ?? false);

  // If isSuperAdmin is false (regular Admin or Viewer): Render as static, disabled badge
  if (!isSuperAdmin) {
    const rawRole = (role || currentRole || 'builder').toString();
    const displayRole =
      rawRole.toUpperCase() === 'MEMBER' || rawRole.toUpperCase() === 'USER'
        ? 'BUILDER'
        : rawRole.toUpperCase();

    const variant =
      displayRole === 'SUPER_ADMIN'
        ? 'accent'
        : displayRole === 'ADMIN'
        ? 'building'
        : 'default';

    return (
      <Badge variant={variant} useBrackets>
        {displayRole}
      </Badge>
    );
  }

  // 2. Role Update Handler calling update_user_role RPC function
  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (newRole === 'super_admin') {
      const confirmTransfer = confirm(
        'There can only be one Super Admin. Transferring this will demote you to Admin. Proceed?'
      );
      if (!confirmTransfer) return;
    }

    setIsPending(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc('update_user_role', {
      target_user_id: targetUserId,
      new_role: newRole,
    });

    if (error) {
      alert(`Error: ${error.message}`);
      setIsPending(false);
    } else {
      setRole(newRole);
      window.location.reload();
    }
  };

  const selectedValue = ['user', 'builder', 'admin', 'super_admin'].includes(role.toLowerCase())
    ? role.toLowerCase()
    : role.toLowerCase() === 'member'
    ? 'builder'
    : 'user';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <select
        value={selectedValue}
        disabled={isPending}
        onChange={(e) => handleRoleChange(userId, e.target.value)}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '4px 8px',
          backgroundColor: 'var(--bg-canvas)',
          color:
            selectedValue === 'super_admin'
              ? 'var(--accent-primary-hover)'
              : 'var(--text-primary)',
          border: '1px solid var(--border-technical)',
          borderRadius: 'var(--radius-xs)',
          cursor: isPending ? 'wait' : 'pointer',
          outline: 'none',
        }}
      >
        <option value="user">user</option>
        <option value="builder">builder</option>
        <option value="admin">admin</option>
        <option value="super_admin">super_admin</option>
      </select>
    </div>
  );
}
