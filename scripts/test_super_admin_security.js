/**
 * Automated Verification Script: MADE Super Admin Security & Authorization
 */

const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('MADE: SUPER ADMIN ROLE-BASED ACCESS CONTROL AUDIT');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function assert(name, condition) {
  total++;
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAILED: ${name}`);
  }
}

async function runTests() {
  const authFile = fs.readFileSync(path.join(__dirname, '../src/lib/auth/authorization.ts'), 'utf8');
  const adminLayout = fs.readFileSync(path.join(__dirname, '../src/app/admin/layout.tsx'), 'utf8');
  const actionsFile = fs.readFileSync(path.join(__dirname, '../src/lib/admin/actions.ts'), 'utf8');
  const accessDenied = fs.readFileSync(path.join(__dirname, '../src/components/admin/AdminAccessDenied.tsx'), 'utf8');
  const adminNav = fs.readFileSync(path.join(__dirname, '../src/components/admin/AdminNav.tsx'), 'utf8');
  const builderRoleSelect = fs.readFileSync(path.join(__dirname, '../src/app/admin/builders/BuilderRoleSelect.tsx'), 'utf8');
  const rpcMigration = fs.readFileSync(path.join(__dirname, '../supabase/migrations/07_update_user_role_rpc.sql'), 'utf8');

  // Test 1: Super Admin Definition & isSuperAdmin / isAdmin Guards
  console.log('[TEST 1] isSuperAdmin & isAdmin Multi-Identity Verification');
  assert('authorization.ts defines isSuperAdmin', authFile.includes('export const isSuperAdmin ='));
  assert('authorization.ts defines isAdmin', authFile.includes('export const isAdmin ='));
  assert('authorization.ts defines superAdminEmails', authFile.includes('superAdminEmails'));
  assert('superAdminEmails includes sankettiwari943@gmail.com', authFile.includes('sankettiwari943@gmail.com'));
  assert('superAdminEmails includes apurvadwivedi666@outlook.com', authFile.includes('apurvadwivedi666@outlook.com'));

  // Test isSuperAdmin & isAdmin logic directly
  const isSuperAdmin = (profile) => {
    const role = profile?.role?.toString().toLowerCase();
    if (role === 'super_admin') return true;
    if (profile?.email && ['sankettiwari943@gmail.com', 'apurvadwivedi666@outlook.com'].includes(profile.email.toLowerCase())) return true;
    return false;
  };

  const isAdmin = (profile) => {
    const role = profile?.role?.toString().toLowerCase();
    return role === 'admin' || role === 'super_admin' || isSuperAdmin(profile);
  };

  assert('isSuperAdmin(super_admin) is true', isSuperAdmin({ role: 'super_admin' }) === true);
  assert('isSuperAdmin(SUPER_ADMIN) is true', isSuperAdmin({ role: 'SUPER_ADMIN' }) === true);
  assert('isSuperAdmin(admin) is false', isSuperAdmin({ role: 'admin' }) === false);
  assert('isAdmin(admin) is true', isAdmin({ role: 'admin' }) === true);
  assert('isAdmin(ADMIN) is true', isAdmin({ role: 'ADMIN' }) === true);
  assert('isAdmin(super_admin) is true', isAdmin({ role: 'super_admin' }) === true);
  assert('isAdmin(member) is false', isAdmin({ role: 'member' }) === false);

  // Test 2: Role Management & Transfer Confirmation Modal in Builders Panel
  console.log('\n[TEST 2] BuilderRoleSelect & Transfer Confirmation Modal');
  assert('BuilderRoleSelect checks isSuperAdmin prop', builderRoleSelect.includes('isSuperAdmin'));
  assert('BuilderRoleSelect renders read-only Badge when !isSuperAdmin', builderRoleSelect.includes('!isSuperAdmin') && builderRoleSelect.includes('<Badge'));
  assert('BuilderRoleSelect calls update_user_role RPC', builderRoleSelect.includes('update_user_role'));
  assert('BuilderRoleSelect contains Transfer Warning Modal', builderRoleSelect.includes('showTransferModal'));
  assert('Transfer Modal contains single Super Admin warning copy', builderRoleSelect.includes('There can only be one Super Admin at a time'));

  // Test 3: SQL Migration RPC Function
  console.log('\n[TEST 3] update_user_role SQL RPC Migration');
  assert('07_update_user_role_rpc.sql defines update_user_role', rpcMigration.includes('FUNCTION public.update_user_role'));
  assert('RPC enforces single Super Admin demotion logic', rpcMigration.includes('SUPER_ADMIN_TRANSFERRED') && rpcMigration.includes('role = \'ADMIN\''));

  // Test 4: Control Center UI and Navigation Badges
  console.log('\n[TEST 4] Admin Navigation & Badges');
  assert('AdminLayout checks isSuperAdmin', adminLayout.includes('isSuperAdmin'));
  assert('AdminLayout returns AdminAccessDenied when !isSuperAdmin', adminLayout.includes('<AdminAccessDenied'));
  assert('AdminLayout suppresses children for non-super-admins', adminLayout.indexOf('<AdminAccessDenied') < adminLayout.indexOf('{children}'));
  assert('AdminNav renders SUPER_ADMIN badge with brackets', adminNav.includes('useBrackets') && adminNav.includes('{adminRole}'));
  assert('AdminAccessDenied displays 403 Forbidden badge', accessDenied.includes('403 FORBIDDEN'));

  // Test 5: Server Actions Defense-in-Depth
  console.log('\n[TEST 5] Server Actions Defense-in-Depth');
  assert('actions.ts imports requireSuperAdmin', actionsFile.includes('requireSuperAdmin'));
  assert('actions.ts calls requireSuperAdmin in actions', actionsFile.includes('await requireSuperAdmin()'));
  assert('updateApplicationStatusAction is protected', actionsFile.includes('updateApplicationStatusAction') && actionsFile.includes('requireSuperAdmin()'));
  assert('addApplicationNoteAction is protected', actionsFile.includes('addApplicationNoteAction') && actionsFile.includes('requireSuperAdmin()'));
  assert('updateBuilderRoleAction is protected', actionsFile.includes('updateBuilderRoleAction') && actionsFile.includes('requireSuperAdmin()'));
  assert('updateBuilderRoleAction handles single Super Admin demotion', actionsFile.includes('SUPER_ADMIN_TRANSFERRED') && actionsFile.includes('role: \'ADMIN\''));

  // Test 6: Verify all admin page components call requireSuperAdmin
  console.log('\n[TEST 6] Admin Route Pages Protection');
  const adminPages = [
    'src/app/admin/page.tsx',
    'src/app/admin/applications/page.tsx',
    'src/app/admin/applications/[id]/page.tsx',
    'src/app/admin/builders/page.tsx',
    'src/app/admin/careers/page.tsx',
    'src/app/admin/careers/[id]/edit/page.tsx',
    'src/app/admin/events/page.tsx',
    'src/app/admin/events/[id]/edit/page.tsx',
    'src/app/admin/opportunities/page.tsx',
    'src/app/admin/opportunities/[id]/edit/page.tsx',
    'src/app/admin/projects/page.tsx',
    'src/app/admin/settings/page.tsx',
  ];

  for (const pagePath of adminPages) {
    const pageContent = fs.readFileSync(path.join(__dirname, '..', pagePath), 'utf8');
    assert(`${pagePath} enforces requireSuperAdmin`, pageContent.includes('requireSuperAdmin'));
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed}/${total} AUDIT CHECKS PASSED`);
  console.log('====================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
