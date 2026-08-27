import { z } from 'zod';

export const UsernameRegex = /^[a-z0-9_]{3,24}$/;

export const UsernameSchema = z
  .string()
  .min(3, { message: 'Username must be at least 3 characters.' })
  .max(24, { message: 'Username cannot exceed 24 characters.' })
  .regex(UsernameRegex, {
    message: 'Username can only contain lowercase letters, numbers, and underscores (no spaces or symbols).',
  })
  .trim()
  .toLowerCase();

export const SignUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: 'Full name must be at least 2 characters.' })
      .max(80, { message: 'Full name cannot exceed 80 characters.' })
      .trim(),
    email: z
      .string()
      .email({ message: 'Please enter a valid academic or personal email address.' })
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SignUpInput = z.infer<typeof SignUpSchema>;

export const LoginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .trim()
    .toLowerCase(),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .trim()
    .toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const OnboardingSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters.' })
    .max(80, { message: 'Full name cannot exceed 80 characters.' })
    .trim(),
  username: UsernameSchema,
  bio: z
    .string()
    .max(280, { message: 'Bio cannot exceed 280 characters.' })
    .optional()
    .or(z.literal('')),
  primaryFocus: z
    .string()
    .min(2, { message: 'Please select or enter your primary discipline/focus.' }),
  location: z
    .string()
    .max(80, { message: 'Location cannot exceed 80 characters.' })
    .optional()
    .or(z.literal('')),
  currentBuild: z
    .string()
    .max(120, { message: 'Current build cannot exceed 120 characters.' })
    .optional()
    .or(z.literal('')),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  githubUrl: z
    .string()
    .url({ message: 'Please enter a valid GitHub URL.' })
    .optional()
    .or(z.literal('')),
  linkedinUrl: z
    .string()
    .url({ message: 'Please enter a valid LinkedIn URL.' })
    .optional()
    .or(z.literal('')),
  portfolioUrl: z
    .string()
    .url({ message: 'Please enter a valid portfolio URL.' })
    .optional()
    .or(z.literal('')),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;
