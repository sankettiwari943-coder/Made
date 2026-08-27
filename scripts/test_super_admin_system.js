/**
 * Automated Verification Script: Private Super Admin Control Center & Content Management
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function fetchPath(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('MADE: PRIVATE SUPER ADMIN CONTROL CENTER AUDIT');
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

  try {
    // 1. Unauthenticated access to /admin must be blocked by middleware & redirected to /login
    console.log('[TEST 1] Middleware Guard on /admin for Unauthenticated Visitors');
    const adminRes = await fetchPath('/admin');
    assert('Status is redirect (307/308/302)', adminRes.status === 307 || adminRes.status === 308 || adminRes.status === 302);
    assert('Redirects to /login?next=/admin', (adminRes.headers.location || '').includes('/login'));

    // 2. Unauthenticated access to /admin/applications
    console.log('\n[TEST 2] Middleware Guard on /admin/applications');
    const appsRes = await fetchPath('/admin/applications');
    assert('Status is redirect (307/308/302)', appsRes.status === 307 || appsRes.status === 308 || appsRes.status === 302);
    assert('Redirects to /login?next=/admin/applications', (appsRes.headers.location || '').includes('/login'));

    // 3. Unauthenticated access to /admin/careers
    console.log('\n[TEST 3] Middleware Guard on /admin/careers');
    const careersRes = await fetchPath('/admin/careers');
    assert('Status is redirect (307/308/302)', careersRes.status === 307 || careersRes.status === 308 || careersRes.status === 302);
    assert('Redirects to /login?next=/admin/careers', (careersRes.headers.location || '').includes('/login'));

    // 4. Unauthenticated access to /admin/opportunities
    console.log('\n[TEST 4] Middleware Guard on /admin/opportunities');
    const oppsRes = await fetchPath('/admin/opportunities');
    assert('Status is redirect (307/308/302)', oppsRes.status === 307 || oppsRes.status === 308 || oppsRes.status === 302);
    assert('Redirects to /login?next=/admin/opportunities', (oppsRes.headers.location || '').includes('/login'));

    // 5. Unauthenticated access to /admin/events
    console.log('\n[TEST 5] Middleware Guard on /admin/events');
    const eventsRes = await fetchPath('/admin/events');
    assert('Status is redirect (307/308/302)', eventsRes.status === 307 || eventsRes.status === 308 || eventsRes.status === 302);
    assert('Redirects to /login?next=/admin/events', (eventsRes.headers.location || '').includes('/login'));

    // 6. Unauthenticated access to /admin/projects
    console.log('\n[TEST 6] Middleware Guard on /admin/projects');
    const projectsRes = await fetchPath('/admin/projects');
    assert('Status is redirect (307/308/302)', projectsRes.status === 307 || projectsRes.status === 308 || projectsRes.status === 302);
    assert('Redirects to /login?next=/admin/projects', (projectsRes.headers.location || '').includes('/login'));

    // 7. Unauthenticated access to /admin/builders
    console.log('\n[TEST 7] Middleware Guard on /admin/builders');
    const buildersRes = await fetchPath('/admin/builders');
    assert('Status is redirect (307/308/302)', buildersRes.status === 307 || buildersRes.status === 308 || buildersRes.status === 302);
    assert('Redirects to /login?next=/admin/builders', (buildersRes.headers.location || '').includes('/login'));

    // 8. Unauthenticated access to /admin/settings
    console.log('\n[TEST 8] Middleware Guard on /admin/settings');
    const settingsRes = await fetchPath('/admin/settings');
    assert('Status is redirect (307/308/302)', settingsRes.status === 307 || settingsRes.status === 308 || settingsRes.status === 302);
    assert('Redirects to /login?next=/admin/settings', (settingsRes.headers.location || '').includes('/login'));

    // 9. Verify Public Directories are accessible without auth
    console.log('\n[TEST 9] Public Directory Accessibility');
    const pubCareers = await fetchPath('/careers');
    assert('/careers accessible (200 OK)', pubCareers.status === 200);
    const pubOpps = await fetchPath('/opportunities');
    assert('/opportunities accessible (200 OK)', pubOpps.status === 200);
    const pubEvents = await fetchPath('/events');
    assert('/events accessible (200 OK)', pubEvents.status === 200);
    const pubProjects = await fetchPath('/projects');
    assert('/projects accessible (200 OK)', pubProjects.status === 200);
    const pubBuiltBy = await fetchPath('/built-by');
    assert('/built-by accessible (200 OK)', pubBuiltBy.status === 200);

    console.log('\n====================================================');
    console.log(`RESULTS: ${passed}/${total} TESTS PASSED`);
    console.log('====================================================');

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Audit suite encountered error:', err);
    process.exit(1);
  }
}

runTests();
