import { z } from 'zod';
import { RoleDepartment, CareerRoleStatus, ApplicationStatus } from '../supabase/types';

export const ROLE_DEPARTMENTS: RoleDepartment[] = [
  'ENGINEERING',
  'AI_ML',
  'DESIGN',
  'CYBERSECURITY',
  'CONTENT',
  'COMMUNITY',
  'OPERATIONS',
  'RESEARCH',
  'OTHER',
];

export const CAREER_ROLE_STATUSES: CareerRoleStatus[] = ['OPEN', 'PAUSED', 'CLOSED', 'ARCHIVED'];

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
];

/**
 * Generate human-readable reference code: e.g. MADE-2026-0482
 */
export function generateReferenceCode(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MADE-${year}-${randomSuffix}`;
}

const HttpUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL starting with http:// or https://' })
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'Only HTTP and HTTPS URLs are permitted.',
  })
  .optional()
  .or(z.literal(''));

export const CareerRoleSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Role title must be at least 2 characters.' })
    .max(100, { message: 'Role title cannot exceed 100 characters.' })
    .trim(),
  department: z.enum([
    'ENGINEERING',
    'AI_ML',
    'DESIGN',
    'CYBERSECURITY',
    'CONTENT',
    'COMMUNITY',
    'OPERATIONS',
    'RESEARCH',
    'OTHER',
  ]),
  short_description: z
    .string()
    .min(10, { message: 'Short description must be at least 10 characters.' })
    .max(280, { message: 'Short description cannot exceed 280 characters.' })
    .trim(),
  description: z
    .string()
    .min(20, { message: 'Full description must be at least 20 characters.' })
    .trim(),
  responsibilities: z
    .string()
    .min(20, { message: 'Responsibilities must be at least 20 characters.' })
    .trim(),
  requirements: z
    .string()
    .min(20, { message: 'Requirements must be at least 20 characters.' })
    .trim(),
  nice_to_have: z.string().optional().or(z.literal('')),
  benefits: z
    .string()
    .min(10, { message: 'Benefits must be at least 10 characters.' })
    .trim(),
  location: z.string().max(100).optional().or(z.literal('')),
  is_remote: z.boolean().default(true),
  commitment: z
    .string()
    .min(2, { message: 'Commitment detail is required.' })
    .default('Part-Time / 10-15 hrs/week'),
  deadline: z.string().optional().or(z.literal('')),
  status: z.enum(['OPEN', 'PAUSED', 'CLOSED', 'ARCHIVED']).default('OPEN'),
  is_published: z.boolean().default(true),
});

export type CareerRoleInput = z.infer<typeof CareerRoleSchema>;

export const CareerApplicationSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters.' })
    .max(120, { message: 'Full name cannot exceed 120 characters.' })
    .trim()
    .optional()
    .or(z.literal('')),
  name: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .optional()
    .or(z.literal('')),
  applicant_email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .optional()
    .or(z.literal('')),
  cover_message: z
    .string()
    .min(20, { message: 'Please share a brief introduction (minimum 20 characters).' })
    .max(3000, { message: 'Introduction cannot exceed 3000 characters.' })
    .trim(),
  what_they_build: z
    .string()
    .min(15, { message: 'Please describe systems or tools you build (minimum 15 characters).' })
    .max(3000)
    .trim(),
  experience: z
    .string()
    .min(15, { message: 'Please describe your background or experience (minimum 15 characters).' })
    .max(3000)
    .trim(),
  github_url: HttpUrlSchema,
  linkedin_url: HttpUrlSchema,
  portfolio_url: HttpUrlSchema,
  resume_path: z.string().optional().or(z.literal('')),
  resume_url: z.string().optional().or(z.literal('')),
  resume: z.string().optional().or(z.literal('')),
  cv_url: z.string().optional().or(z.literal('')),
  file_url: z.string().optional().or(z.literal('')),
  additional_information: z.string().max(2000).optional().or(z.literal('')),
});

export type CareerApplicationInput = z.infer<typeof CareerApplicationSchema>;

/**
 * Format raw application status into a user-facing label
 */
export function formatApplicationStatus(status?: string | null): string {
  if (!status) return 'PENDING';
  switch (status.toUpperCase()) {
    case 'SUBMITTED':
      return 'PENDING';
    case 'UNDER_REVIEW':
      return 'REVIEWING';
    case 'SHORTLISTED':
      return 'SHORTLISTED';
    case 'INTERVIEW':
      return 'INTERVIEW';
    case 'ACCEPTED':
      return 'ACCEPTED';
    case 'REJECTED':
      return 'DECIDED';
    case 'WITHDRAWN':
      return 'WITHDRAWN';
    default:
      return status.replace('_', ' ').toUpperCase();
  }
}

export const ApplicationNoteSchema = z.object({
  content: z
    .string()
    .min(2, { message: 'Note content cannot be empty.' })
    .max(4000)
    .trim(),
});

export type ApplicationNoteInput = z.infer<typeof ApplicationNoteSchema>;

