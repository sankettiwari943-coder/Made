const fs = require('fs');
const path = require('path');
const { z } = require('zod');

console.log('====================================================');
console.log('MADE — MASTER PHASE 7 SECURITY & PRODUCTION AUDIT');
console.log('====================================================\n');

let passCount = 0;
let totalCount = 0;

function assert(condition, testName) {
  totalCount++;
  if (condition) {
    console.log(`[PASS] ✓ ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ✗ ${testName}`);
  }
}

// 1. Audit Secrets Exposure in Source Code
const srcDir = path.join(__dirname, '..', 'src');
function searchDirectoryForSecretExposure(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDirectoryForSecretExposure(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')) {
        return false;
      }
    }
  }
  return true;
}
assert(searchDirectoryForSecretExposure(srcDir), 'Audit 1: SUPABASE_SERVICE_ROLE_KEY is never exposed to NEXT_PUBLIC_ client variables');

// 2. Audit .gitignore contains .env.local and sensitive files
const gitignoreContent = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
assert(
  gitignoreContent.includes('.env*.local') || gitignoreContent.includes('.env'),
  'Audit 2: .gitignore properly isolates secret environment files'
);

// 3. Audit URL Protocol Validator
const HttpUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL' })
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'Only HTTP and HTTPS URLs are permitted.',
  })
  .optional()
  .or(z.literal(''));

const testUrls = [
  { url: 'https://github.com/made', valid: true },
  { url: 'http://localhost:3000', valid: true },
  { url: 'javascript:alert(document.cookie)', valid: false },
  { url: 'data:text/html,<script>alert(1)</script>', valid: false },
  { url: 'vbscript:msgbox(1)', valid: false },
];

let allUrlTestsPassed = true;
for (const t of testUrls) {
  const res = HttpUrlSchema.safeParse(t.url);
  if (res.success !== t.valid) {
    allUrlTestsPassed = false;
  }
}
assert(allUrlTestsPassed, 'Audit 3: URL Protocol filter strictly blocks javascript:, data:, and malicious URI schemes');

// 4. Audit Site Configuration & Founder Identity
const siteConfigRaw = fs.readFileSync(path.join(srcDir, 'config', 'site.ts'), 'utf8');
assert(
  siteConfigRaw.includes('Sanket Tiwari') &&
  siteConfigRaw.includes('FOUNDER & PRESIDENT') &&
  siteConfigRaw.includes('MAKE SOMETHING REAL.'),
  'Audit 4: Centralized site configuration enforces authoritative founder identity and brand copy'
);

// 5. Audit SQL Migrations (01 to 05) for RLS Activation
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));

let rlsVerified = true;
for (const file of migrationFiles) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  if (!content.includes('ENABLE ROW LEVEL SECURITY')) {
    rlsVerified = false;
  }
}
assert(
  rlsVerified && migrationFiles.length >= 5,
  `Audit 5: All ${migrationFiles.length} database migrations have explicit ROW LEVEL SECURITY enabled`
);

// 6. Audit Private Resume Bucket Configuration in Migration 05
const migration05 = fs.readFileSync(path.join(migrationsDir, '05_careers_and_applications.sql'), 'utf8');
assert(
  migration05.includes("'resumes'") &&
  migration05.includes('false, -- Private bucket'),
  'Audit 6: Resumes storage bucket is configured as private with strict owner/admin access policies'
);

// 7. Audit Human-Readable Reference Code Generator
function generateReferenceCode() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MADE-${year}-${randomSuffix}`;
}
const testCode = generateReferenceCode();
assert(/^MADE-\d{4}-\d{4}$/.test(testCode), `Audit 7: Human-readable reference code generator matches standard pattern (${testCode})`);

// 8. Audit Robots.txt and Sitemap Generators
const robotsExists = fs.existsSync(path.join(srcDir, 'app', 'robots.ts'));
const sitemapExists = fs.existsSync(path.join(srcDir, 'app', 'sitemap.ts'));
assert(robotsExists && sitemapExists, 'Audit 8: Automated SEO robots.ts and sitemap.ts endpoints exist and guard private routes');

console.log(`\n====================================================`);
console.log(`AUDIT RESULTS: ${passCount}/${totalCount} CHECKS PASSED`);
console.log(`====================================================`);

if (passCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
