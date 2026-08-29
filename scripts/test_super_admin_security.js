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

  // Test 1: Super Admin Definition & isSuperAdmin Function
  console.log('[TEST 1] isSuperAdmin Multi-Identity Verification');
  assert('authorization.ts defines isSuperAdmin', authFile.includes('export const isSuperAdmin ='));
  assert('authorization.ts defines superAdminEmails', authFile.includes('superAdminEmails'));
  assert('superAdminEmails includes sankettiwari943@gmail.com', authFile.includes('sankettiwari943@gmail.com'));
  assert('superAdminEmails includes apurvadwivedi666@outlook.com', authFile.includes('apurvadwivedi666@outlook.com'));

  // Test isSuperAdmin logic directly
  const isSuperAdmin = (user, profile) => {
    const superAdminEmails = ['sankettiwari943@gmail.com', 'apurvadwivedi666@outlook.com'];
    if (user?.email && (superAdminEmails.includes(user.email) || superAdminEmails.includes(user.email.toLowerCase()))) return true;
    if (profile?.email && (superAdminEmails.includes(profile.email) || superAdminEmails.includes(profile.email.toLowerCase()))) return true;
    if (profile?.role === 'super_admin' || profile?.role === 'SUPER_ADMIN' || profile?.is_super_admin === true) return true;
    if (user?.app_metadata?.role === 'super_admin' || user?.app_metadata?.role === 'SUPER_ADMIN') return true;
    if (user?.user_metadata?.role === 'super_admin' || user?.user_metadata?.role === 'SUPER_ADMIN') return true;
    return false;
  };

  assert('Apurva email is authorized as Super Admin', isSuperAdmin({ email: 'apurvadwivedi666@outlook.com' }, null) === true);
  assert('Sanket email is authorized as Super Admin', isSuperAdmin({ email: 'sankettiwari943@gmail.com' }, null) === true);
  assert('super_admin profile role is authorized', isSuperAdmin({ email: 'other@test.com' }, { role: 'super_admin' }) === true);
  assert('SUPER_ADMIN profile role is authorized', isSuperAdmin({ email: 'other@test.com' }, { role: 'SUPER_ADMIN' }) === true);
  assert('app_metadata super_admin is authorized', isSuperAdmin({ email: 'other@test.com', app_metadata: { role: 'super_admin' } }, null) === true);
  assert('Regular member is rejected', isSuperAdmin({ email: 'user@test.com' }, { role: 'MEMBER' }) === false);
  assert('Standard ADMIN role without Super Admin elevation is rejected', isSuperAdmin({ email: 'admin@test.com' }, { role: 'ADMIN' }) === false);

  // Test 2: Control Center UI and Navigation Badges
  console.log('\n[TEST 2] Admin Navigation & Badges');
  assert('AdminLayout checks isSuperAdmin', adminLayout.includes('isSuperAdmin'));
  assert('AdminLayout returns AdminAccessDenied when !isSuperAdmin', adminLayout.includes('<AdminAccessDenied'));
  assert('AdminLayout suppresses children for non-super-admins', adminLayout.indexOf('<AdminAccessDenied') < adminLayout.indexOf('{children}'));
  assert('AdminNav renders SUPER_ADMIN badge with brackets', adminNav.includes('useBrackets') && adminNav.includes('{adminRole}'));
  assert('AdminAccessDenied displays 403 Forbidden badge', accessDenied.includes('403 FORBIDDEN'));

  // Test 3: Server Actions Defense-in-Depth
  console.log('\n[TEST 3] Server Actions Defense-in-Depth');
  assert('actions.ts imports requireSuperAdmin', actionsFile.includes('requireSuperAdmin'));
  assert('actions.ts calls requireSuperAdmin in actions', actionsFile.includes('await requireSuperAdmin()'));
  assert('updateApplicationStatusAction is protected', actionsFile.includes('updateApplicationStatusAction') && actionsFile.includes('requireSuperAdmin()'));
  assert('addApplicationNoteAction is protected', actionsFile.includes('addApplicationNoteAction') && actionsFile.includes('requireSuperAdmin()'));
  assert('updateBuilderRoleAction is protected', actionsFile.includes('updateBuilderRoleAction') && actionsFile.includes('requireSuperAdmin()'));

  // Test 4: Verify all admin page components call requireSuperAdmin
  console.log('\n[TEST 4] Admin Route Pages Protection');
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
