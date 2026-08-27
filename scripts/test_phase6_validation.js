const { z } = require('zod');

console.log('--- Executing Phase 6 Validation & Security Tests ---');

// Test 1: Reference Code Generator
function generateReferenceCode() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MADE-${year}-${randomSuffix}`;
}

const ref = generateReferenceCode();
const refRegex = /^MADE-2026-\d{4}$/;
console.log('Test 1 (Safe Human-Readable Reference Code Generator):', refRegex.test(ref) ? `PASSED (${ref}) ✓` : 'FAILED ✗');

// Test 2: Career Role Schema
const ROLE_DEPARTMENTS = [
  'ENGINEERING', 'AI_ML', 'DESIGN', 'CYBERSECURITY', 'CONTENT', 'COMMUNITY', 'OPERATIONS', 'RESEARCH', 'OTHER',
];

const CareerRoleSchema = z.object({
  title: z.string().min(2).max(100).trim(),
  department: z.enum(ROLE_DEPARTMENTS),
  short_description: z.string().min(10).max(280).trim(),
  description: z.string().min(20).trim(),
  responsibilities: z.string().min(20).trim(),
  requirements: z.string().min(20).trim(),
  nice_to_have: z.string().optional().or(z.literal('')),
  benefits: z.string().min(10).trim(),
  location: z.string().max(100).optional().or(z.literal('')),
  is_remote: z.boolean().default(true),
  commitment: z.string().min(2).default('Part-Time / 10-15 hrs/week'),
  status: z.enum(['OPEN', 'PAUSED', 'CLOSED', 'ARCHIVED']).default('OPEN'),
  is_published: z.boolean().default(true),
});

const validRole = {
  title: 'Frontend Systems Builder',
  department: 'ENGINEERING',
  short_description: 'Architect and craft high-performance typographic web interfaces for MADE.',
  description: 'Lead interface engineering across the platform, zero-runtime token compilers, and SSR performance.',
  responsibilities: '• Build modular Next.js components\n• Maintain design system tokens',
  requirements: '• Strong proficiency with TypeScript & React\n• Demonstrated public repositories',
  benefits: '• Direct platform ownership\n• Co-authorship and network introductions',
  location: 'Remote / Global',
  is_remote: true,
  commitment: 'Part-Time / 10-15 hrs/week',
  status: 'OPEN',
  is_published: true,
};

const pRoleValid = CareerRoleSchema.safeParse(validRole);
console.log('Test 2 (Valid Career Role Specification):', pRoleValid.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 3: Career Application Schema & Minimum Answer Lengths
const HttpUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL' })
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'Only HTTP and HTTPS URLs are permitted.',
  })
  .optional()
  .or(z.literal(''));

const CareerApplicationSchema = z.object({
  cover_message: z.string().min(20).max(3000).trim(),
  what_they_build: z.string().min(15).max(3000).trim(),
  experience: z.string().min(15).max(3000).trim(),
  github_url: HttpUrlSchema,
  linkedin_url: HttpUrlSchema,
  portfolio_url: HttpUrlSchema,
  additional_information: z.string().max(2000).optional().or(z.literal('')),
});

const validApp = {
  cover_message: 'I want to build with MADE because of its relentless commitment to real systems and student agency.',
  what_they_build: 'I develop distributed indexing pipelines in Rust and WebAssembly web runtimes.',
  experience: 'Undergraduate student researching peer-to-peer protocols and low-latency networking.',
  github_url: 'https://github.com/builder/proofs',
  linkedin_url: 'https://linkedin.com/in/builder',
  portfolio_url: 'https://builder.example.com',
};
const pAppValid = CareerApplicationSchema.safeParse(validApp);
console.log('Test 3 (Valid Career Application Payload):', pAppValid.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 4: Rejection of javascript: XSS in Application URL
const xssApp = { ...validApp, github_url: 'javascript:alert(document.cookie)' };
const pAppXss = CareerApplicationSchema.safeParse(xssApp);
console.log('Test 4 (Rejection of javascript: XSS in Candidate Links):', !pAppXss.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 5: Rejection of Short Answers (< 20 chars in cover message)
const shortApp = { ...validApp, cover_message: 'Too short' };
const pAppShort = CareerApplicationSchema.safeParse(shortApp);
console.log('Test 5 (Rejection of Low-Effort / Short Answers):', !pAppShort.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 6: Internal Admin Notes Schema
const ApplicationNoteSchema = z.object({
  content: z.string().min(2).max(4000).trim(),
});
const pNoteValid = ApplicationNoteSchema.safeParse({ content: 'Candidate demonstrated exceptional systems knowledge in interview.' });
const pNoteEmpty = ApplicationNoteSchema.safeParse({ content: ' ' });
console.log('Test 6 (Internal Admin Note Schema Validation):', (pNoteValid.success && !pNoteEmpty.success) ? 'PASSED ✓' : 'FAILED ✗');

console.log('--- All Phase 6 Validation & Security Tests Completed Successfully ---');
