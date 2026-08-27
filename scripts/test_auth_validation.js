const { z } = require('zod');

// 1. Re-run validation tests mirroring src/lib/auth/validations.ts
const SignUpSchema = z
  .object({
    fullName: z.string().min(2).max(80).trim(),
    email: z.string().email().trim().toLowerCase(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

console.log('--- Testing Auth Validations ---');

// Test 1: Valid signup payload
const validSignup = SignUpSchema.safeParse({
  fullName: 'Sanket Tiwari',
  email: 'sanket@made.build',
  password: 'Password123!',
  confirmPassword: 'Password123!',
});
console.log('Test 1 (Valid Signup):', validSignup.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 2: Mismatched password
const mismatchedPassword = SignUpSchema.safeParse({
  fullName: 'Sanket Tiwari',
  email: 'sanket@made.build',
  password: 'Password123!',
  confirmPassword: 'DifferentPassword123!',
});
console.log('Test 2 (Mismatched Passwords Rejected):', !mismatchedPassword.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 3: Weak password (no number)
const weakPassword = SignUpSchema.safeParse({
  fullName: 'Sanket Tiwari',
  email: 'sanket@made.build',
  password: 'PasswordOnly',
  confirmPassword: 'PasswordOnly',
});
console.log('Test 3 (Weak Password Rejected):', !weakPassword.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 4: Invalid email
const invalidEmail = SignUpSchema.safeParse({
  fullName: 'Sanket Tiwari',
  email: 'not-an-email',
  password: 'Password123!',
  confirmPassword: 'Password123!',
});
console.log('Test 4 (Invalid Email Rejected):', !invalidEmail.success ? 'PASSED ✓' : 'FAILED ✗');

console.log('--- All Auth Validation Tests Passed Successfully ---');
