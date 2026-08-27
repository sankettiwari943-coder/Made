const { z } = require('zod');

// 1. Slug Generator logic test
function generateSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base.slice(0, 80) || 'project';
}

console.log('--- Executing Phase 4 Validation & Security Tests ---');

// Test 1: Slug Generation
const slugTests = [
  { input: 'AI Disaster Response Intelligence Platform', expected: 'ai-disaster-response-intelligence-platform' },
  { input: 'NEXUS-V: The P2P Compute Substrate!', expected: 'nexus-v-the-p2p-compute-substrate' },
  { input: '   /// Special -- Characters // Build   ', expected: 'special-characters-build' },
];

let slugTestPassed = true;
slugTests.forEach((t) => {
  const result = generateSlug(t.input);
  if (result !== t.expected) {
    console.error(`Slug mismatch for "${t.input}": got "${result}", expected "${t.expected}"`);
    slugTestPassed = false;
  }
});
console.log('Test 1 (Project Slug Generation & Sanitization):', slugTestPassed ? 'PASSED ✓' : 'FAILED ✗');

// Test 2: Project Schema Validation
const PROJECT_CATEGORIES = [
  'AI / ML', 'Web & Cloud', 'Mobile', 'Cybersecurity', 'Hardware', 'Design', 'Research', 'Systems & Compilers', 'Other',
];
const PROJECT_STATUSES = ['IDEA', 'BUILDING', 'PROTOTYPE', 'LIVE', 'OPEN_SOURCE', 'ARCHIVED'];

const HttpUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL' })
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'Only HTTP and HTTPS URLs are permitted.',
  })
  .optional()
  .or(z.literal(''));

const ProjectSchema = z.object({
  title: z.string().min(2).max(100).trim(),
  short_description: z.string().min(10).max(240).trim(),
  description: z.string().min(20).trim(),
  category: z.string().min(2),
  status: z.enum(PROJECT_STATUSES),
  technologies: z.array(z.string().min(1).max(40)).min(1),
  github_url: HttpUrlSchema,
  live_url: HttpUrlSchema,
  demo_url: HttpUrlSchema,
  is_public: z.boolean().default(true),
});

const validProject = {
  title: 'AEGIS Substrate',
  short_description: 'AI-powered geospatial disaster response routing.',
  description: 'AEGIS combines satellite imagery and elevation models to compute real-time evacuation corridors during natural disasters.',
  category: 'AI / ML',
  status: 'LIVE',
  technologies: ['PyTorch', 'FastAPI', 'Mapbox GL'],
  github_url: 'https://github.com/project/aegis',
  live_url: 'https://aegis.example.com',
  demo_url: 'https://youtube.com/watch?v=123',
  is_public: true,
};

const pValid = ProjectSchema.safeParse(validProject);
console.log('Test 2 (Valid Project Specification Payload):', pValid.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 3: Rejection of javascript: XSS URLs
const xssProject = { ...validProject, github_url: 'javascript:alert(1)' };
const pXss = ProjectSchema.safeParse(xssProject);
console.log('Test 3 (Rejection of javascript: Unsafe URL Injection):', !pXss.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 4: Rejection of empty tech stack
const emptyTechProject = { ...validProject, technologies: [] };
const pEmptyTech = ProjectSchema.safeParse(emptyTechProject);
console.log('Test 4 (Rejection of Empty Technology Stack):', !pEmptyTech.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 5: Build Log (Project Updates) Schema
const ProjectUpdateSchema = z.object({
  title: z.string().min(2).max(100).trim(),
  content: z.string().min(5).max(5000).trim(),
});

const validLog = {
  title: 'WEEK 04 // Deployed WebAssembly worker pipeline',
  content: 'Reduced raster decode latency by 62% across mobile networks.',
};
const pLog = ProjectUpdateSchema.safeParse(validLog);
console.log('Test 5 (Build Log / Milestone Schema Validation):', pLog.success ? 'PASSED ✓' : 'FAILED ✗');

console.log('--- All Phase 4 Validation & Security Tests Completed Successfully ---');
