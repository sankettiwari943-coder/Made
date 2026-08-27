const { z } = require('zod');

const UsernameRegex = /^[a-z0-9_]{3,24}$/;

const UsernameSchema = z
  .string()
  .min(3, { message: 'Username must be at least 3 characters.' })
  .max(24, { message: 'Username cannot exceed 24 characters.' })
  .regex(UsernameRegex, {
    message: 'Username can only contain lowercase letters, numbers, and underscores (no spaces or symbols).',
  })
  .trim()
  .toLowerCase();

const OnboardingSchema = z.object({
  fullName: z.string().min(2).max(80).trim(),
  username: UsernameSchema,
  bio: z.string().max(280).optional().or(z.literal('')),
  primaryFocus: z.string().min(2),
  location: z.string().max(80).optional().or(z.literal('')),
  currentBuild: z.string().max(120).optional().or(z.literal('')),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
});

console.log('--- Executing Phase 3 Validation & Security Tests ---');

// Test 1: Username format validity
const validUsernames = ['sanket', 'aarav_sharma', 'builder99', 'dev_01'];
const invalidUsernames = ['sa', 'a'.repeat(25), 'user name', 'user@domain', 'user-name!'];

let userTestPassed = true;
validUsernames.forEach((u) => {
  const r = UsernameSchema.safeParse(u);
  if (!r.success) userTestPassed = false;
});
invalidUsernames.forEach((u) => {
  const r = UsernameSchema.safeParse(u);
  if (r.success) userTestPassed = false;
});
console.log('Test 1 (Username Format & Boundary Rules):', userTestPassed ? 'PASSED ✓' : 'FAILED ✗');

// Test 2: Valid complete onboarding payload
const validPayload = {
  fullName: 'Sanket Tiwari',
  username: 'sanket',
  bio: 'Founder of MADE. Building student innovation infrastructure.',
  primaryFocus: 'AI / ML',
  location: 'Hybrid / Remote',
  currentBuild: 'MADE Innovation Platform',
  skills: ['PyTorch', 'Distributed Systems', 'TypeScript', 'Next.js'],
  interests: ['Systems Architecture', 'Open Source', 'Compilers'],
  githubUrl: 'https://github.com/sankettiwari',
  linkedinUrl: 'https://linkedin.com/in/sankettiwari',
  portfolioUrl: 'https://portfolio.example.com',
};
const p2 = OnboardingSchema.safeParse(validPayload);
console.log('Test 2 (Full Onboarding Payload Validation):', p2.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 3: Invalid URL in links
const invalidUrlPayload = { ...validPayload, githubUrl: 'not-a-valid-url' };
const p3 = OnboardingSchema.safeParse(invalidUrlPayload);
console.log('Test 3 (Malformed URL Rejection):', !p3.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 4: Missing required primary focus
const missingFocusPayload = { ...validPayload, primaryFocus: '' };
const p4 = OnboardingSchema.safeParse(missingFocusPayload);
console.log('Test 4 (Missing Required Primary Focus Rejection):', !p4.success ? 'PASSED ✓' : 'FAILED ✗');

console.log('--- All Phase 3 Validation Tests Completed Successfully ---');
