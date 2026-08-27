/**
 * Verification Script: Zero Demo/Mock Data & Intentional Empty States
 */

const BASE_URL = 'http://localhost:3000';

async function runCleanupTests() {
  console.log('====================================================');
  console.log('MADE: ZERO DEMO DATA & EMPTY STATE AUDIT');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function testRoute(name, path, assertions) {
    total++;
    try {
      const res = await fetch(`${BASE_URL}${path}`);
      const text = await res.text();
      let allPassed = true;

      console.log(`[TEST ${total}] ${name} (${path}) -> Status: ${res.status}`);

      for (const [desc, condition] of Object.entries(assertions)) {
        const result = condition(res, text);
        if (result) {
          console.log(`  ✓ ${desc}`);
        } else {
          console.error(`  ✗ FAILED: ${desc}`);
          allPassed = false;
        }
      }

      if (allPassed) passed++;
      console.log('');
    } catch (err) {
      console.error(`  ✗ FAILED to fetch ${path}:`, err.message);
      console.log('');
    }
  }

  // 1. Projects Directory
  await testRoute('Projects Directory Empty State', '/projects', {
    'Status is 200 OK': (res) => res.status === 200,
    'Contains intentional empty state title': (_, text) => text.includes('Nothing Shipped Here. Yet.'),
    'Contains intentional empty state copy': (_, text) => text.includes('The workspace is ready. The next build could be yours.'),
    'Does not contain fake NEXUS-V project': (_, text) => !text.includes('NEXUS-V Edge Substrate') && !text.includes('NEXUS-V'),
    'Does not contain fake ORBITAL project': (_, text) => !text.includes('ORBITAL Design Matrix'),
  });

  // 2. Builders Directory
  await testRoute('Builders Directory Empty State', '/builders', {
    'Status is 200 OK': (res) => res.status === 200,
    'Contains intentional empty state title': (_, text) => text.includes('The Builder Directory is Just Opening.'),
    'Contains intentional empty state copy': (_, text) => text.includes('No profiles have been published yet.'),
    'Does not contain fake builder Aarav': (_, text) => !text.includes('Aarav Sharma'),
    'Does not contain fake builder Elena': (_, text) => !text.includes('Elena Vance'),
    'Does not contain fake builder Kavita': (_, text) => !text.includes('Kavita Iyer'),
  });

  // 3. Opportunities Directory
  await testRoute('Opportunities Directory Empty State', '/opportunities', {
    'Status is 200 OK': (res) => res.status === 200,
    'Contains intentional empty state title': (_, text) => text.includes('Nothing Open Right Now.'),
    'Contains intentional empty state copy': (_, text) => text.includes('keeping the board clean until') && text.includes('worth applying to'),
    'Does not contain fake ETHGlobal hackathon': (_, text) => !text.includes('ETHGlobal Autonomous Agents'),
    'Does not contain fake KP fellowship': (_, text) => !text.includes('Kleiner Perkins Fellows Program'),
  });

  // 4. Events Calendar
  await testRoute('Events Calendar Empty State', '/events', {
    'Status is 200 OK': (res) => res.status === 200,
    'Contains intentional empty state title': (_, text) => text.includes('The Calendar is Quiet.'),
    'Contains intentional empty state copy': (_, text) => text.includes('waiting for the next thing worth gathering for'),
    'Does not contain fake Build Night 01': (_, text) => !text.includes('MADE Build Night 01'),
    'Does not contain fake Compiler Salon': (_, text) => !text.includes('Compiler Construction Salon'),
  });

  // 5. Careers Page
  await testRoute('Careers Page Empty State', '/careers', {
    'Status is 200 OK': (res) => res.status === 200,
    'Contains intentional empty state title': (_, text) => text.includes('Not Hiring. Still Building.'),
    'Contains intentional empty state copy': (_, text) => text.includes('There are no open roles right now.'),
    'Does not contain fake Frontend Systems role': (_, text) => !text.includes('Frontend Systems Builder'),
    'Does not contain fake Applied AI role': (_, text) => !text.includes('Applied AI & Systems Builder'),
  });

  // 6. Homepage Empty States
  await testRoute('Homepage Empty States', '/', {
    'Status is 200 OK': (res) => res.status === 200,
    'Projects Section has intentional empty state': (_, text) => text.includes('Nothing Shipped Here. Yet.'),
    'Builders Section has intentional empty state': (_, text) => text.includes('The Builder Directory is Just Opening.'),
    'Opportunities Section has intentional empty state': (_, text) => text.includes('Nothing Open Right Now.'),
  });

  // 7. Built-By Page Preservation
  await testRoute('Built-By Founder Profile', '/built-by', {
    'Status is 200 OK': (res) => res.status === 200,
    'Contains Founder Name': (_, text) => text.includes('Sanket Tiwari'),
    'Contains Founder Title': (_, text) => text.includes('FOUNDER') && text.includes('PRESIDENT'),
    'Contains Founder Image link': (_, text) => text.includes('sanket-tiwari.jpg'),
  });

  // 8. Former fake slug 404 test
  await testRoute('Deleted Mock Slugs Return 404', '/projects/nexus-v-runtime', {
    'Returns 404 for deleted fake slug': (res) => res.status === 404,
  });

  console.log('====================================================');
  console.log(`RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('====================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runCleanupTests();
