'use client';

import React, { useState, useTransition } from 'react';
import { UserRole } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';
import { updateBuilderRoleAction } from '@/lib/admin/actions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface BuilderRoleSelectProps {
  userId: string;
  currentRole: UserRole | string;
  builderName: string;
  isSuperAdmin?: boolean;
}

export function BuilderRoleSelect({
  userId,
  currentRole,
  builderName,
  isSuperAdmin = true,
}: BuilderRoleSelectProps) {
  const [role, setRole] = useState<string>(currentRole);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  // If user is not Super Admin, render as static read-only badge
  if (!isSuperAdmin) {
    const displayRole =
      role.toUpperCase() === 'MEMBER'
        ? 'BUILDER'
        : role.toUpperCase();

    const variant =
      role.toUpperCase() === 'SUPER_ADMIN'
        ? 'accent'
        : role.toUpperCase() === 'ADMIN'
        ? 'building'
        : 'default';

    return (
      <Badge variant={variant} useBrackets>
        {displayRole}
      </Badge>
    );
  }

  const handleRoleChange = async (targetRole: string) => {
    startTransition(async () => {
      try {
        const supabase = createClient();
        
        // Execute role update via RPC function
        const { data, error } = await supabase.rpc('update_user_role', {
          target_user_id: userId,
          new_role: targetRole,
        });

        if (error) {
          // Fallback to server action
          const res = await updateBuilderRoleAction(userId, targetRole as UserRole, builderName);
          setRole(targetRole);
          setMessage(res.message || `Role updated to [${targetRole}]`);
        } else {
          setRole(targetRole);
          setMessage(data?.message || `Role updated to [${targetRole}]`);
        }

        setTimeout(() => setMessage(null), 4000);
      } catch (err: any) {
        alert(err.message || 'Failed to update role');
      }
    });
  };

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === role) return;

    if (selected.toUpperCase() === 'SUPER_ADMIN') {
      setPendingRole(selected);
      setShowTransferModal(true);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to change the role of "${builderName}" to [${selected}]?`
    );
    if (!confirmed) return;

    handleRoleChange(selected);
  };

  const handleConfirmTransfer = () => {
    if (!pendingRole) return;
    setShowTransferModal(false);
    handleRoleChange(pendingRole);
    setPendingRole(null);
  };

  const handleCancelTransfer = () => {
    setShowTransferModal(false);
    setPendingRole(null);
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <select
          value={role.toUpperCase()}
          disabled={isPending}
          onChange={onSelectChange}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 8px',
            backgroundColor: 'var(--bg-canvas)',
            color:
              role.toUpperCase() === 'SUPER_ADMIN'
                ? 'var(--accent-primary-hover)'
                : 'var(--text-primary)',
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

      {/* Transfer Super Admin Confirmation Modal */}
      {showTransferModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              maxWidth: '480px',
              width: '100%',
              padding: 'var(--space-8)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)',
            }}
          >
            <div>
              <span
                className="technical-label"
                style={{ color: 'var(--color-warning)', display: 'block', marginBottom: 'var(--space-2)' }}
              >
                SECURITY WARNING // PRIVILEGE TRANSFER
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Transfer Super Admin Privileges?
              </h3>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderLeft: '3px solid var(--color-warning)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                Transferring Super Admin privileges will demote your account to Admin. There can only be one Super Admin at a time. Do you want to proceed?
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 'var(--space-3)',
              }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelTransfer}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmTransfer}
                disabled={isPending}
                style={{
                  backgroundColor: 'var(--color-danger)',
                  borderColor: 'var(--color-danger)',
                }}
              >
                {isPending ? 'Transferring...' : 'Transfer Super Admin'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
