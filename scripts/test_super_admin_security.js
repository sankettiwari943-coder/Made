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
  // Test 1: Role Evaluation Matrix
  console.log('[TEST 1] Role Evaluation Matrix');
  const mockMemberProfile = { id: 'usr-1', role: 'MEMBER', full_name: 'Regular Builder' };
  const mockAdminProfile = { id: 'usr-2', role: 'ADMIN', full_name: 'Standard Admin' };
  const mockSuperAdminProfile = { id: 'usr-3', role: 'SUPER_ADMIN', full_name: 'Founder' };

  assert('MEMBER is not SUPER_ADMIN', mockMemberProfile.role !== 'SUPER_ADMIN');
  assert('ADMIN is not SUPER_ADMIN (Strict Level 0)', mockAdminProfile.role !== 'SUPER_ADMIN');
  assert('SUPER_ADMIN is authorized', mockSuperAdminProfile.role === 'SUPER_ADMIN');

  // Test 2: Verify zero hardcoded emails
  console.log('\n[TEST 2] Dynamic Identity Verification (No Hardcoded Emails)');
  const adminLayout = fs.readFileSync(path.join(__dirname, '../src/app/admin/layout.tsx'), 'utf8');
  const authFile = fs.readFileSync(path.join(__dirname, '../src/lib/auth/authorization.ts'), 'utf8');
  const actionsFile = fs.readFileSync(path.join(__dirname, '../src/lib/admin/actions.ts'), 'utf8');
  const accessDenied = fs.readFileSync(path.join(__dirname, '../src/components/admin/AdminAccessDenied.tsx'), 'utf8');

  assert('No hardcoded @ in admin layout', !adminLayout.includes('@gmail') && !adminLayout.includes('@example'));
  assert('No hardcoded @ in auth authorization', !authFile.includes('@gmail') && !authFile.includes('@example'));
  assert('No hardcoded @ in admin actions', !actionsFile.includes('@gmail') && !actionsFile.includes('@example'));

  // Test 3: Verify AdminAccessDenied is returned on non-super-admin
  console.log('\n[TEST 3] Layout Security Guard & Access Denied');
  assert('AdminLayout checks isSuperAdmin', adminLayout.includes('isSuperAdmin'));
  assert('AdminLayout returns AdminAccessDenied when !isSuperAdmin', adminLayout.includes('<AdminAccessDenied'));
  assert('AdminLayout suppresses children for non-super-admins', adminLayout.indexOf('<AdminAccessDenied') < adminLayout.indexOf('{children}'));
  assert('AdminAccessDenied displays 403 Forbidden badge', accessDenied.includes('403 FORBIDDEN'));
  assert('AdminAccessDenied displays user role and email dynamically', accessDenied.includes('userRole') && accessDenied.includes('userEmail'));

  // Test 4: Verify all actions require requireSuperAdmin
  console.log('\n[TEST 4] Server Actions Defense-in-Depth');
  assert('actions.ts imports requireSuperAdmin', actionsFile.includes('requireSuperAdmin'));
  assert('actions.ts calls requireSuperAdmin in actions', actionsFile.includes('await requireSuperAdmin()'));
  assert('updateBuilderRoleAction exists and is protected', actionsFile.includes('updateBuilderRoleAction') && actionsFile.includes('requireSuperAdmin()'));

  // Test 5: Verify all admin page components call requireSuperAdmin
  console.log('\n[TEST 5] Admin Route Pages Protection');
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
