import { z } from 'zod';
import { OpportunityType, OpportunityStatus } from '../supabase/types';

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  'HACKATHON',
  'INTERNSHIP',
  'FELLOWSHIP',
  'COMPETITION',
  'SCHOLARSHIP',
  'GRANT',
  'PROGRAM',
  'OTHER',
];

export const OPPORTUNITY_STATUSES: OpportunityStatus[] = [
  'OPEN',
  'CLOSING_SOON',
  'CLOSED',
  'ARCHIVED',
];

export function calculateOpportunityStatus(deadlineStr: string | null | undefined): OpportunityStatus {
  if (!deadlineStr) return 'OPEN';
  const deadlineDate = new Date(deadlineStr);
  const now = new Date();

  if (deadlineDate < now) {
    return 'CLOSED';
  }

  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays <= 5) {
    return 'CLOSING_SOON';
  }

  return 'OPEN';
}

const HttpUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL starting with http:// or https://' })
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'Only HTTP and HTTPS URLs are permitted.',
  })
  .optional()
  .or(z.literal(''));

export const OpportunitySchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Title must be at least 2 characters.' })
    .max(120, { message: 'Title cannot exceed 120 characters.' })
    .trim(),
  organization: z
    .string()
    .min(2, { message: 'Organization name is required.' })
    .max(100)
    .trim(),
  type: z.enum([
    'HACKATHON',
    'INTERNSHIP',
    'FELLOWSHIP',
    'COMPETITION',
    'SCHOLARSHIP',
    'GRANT',
    'PROGRAM',
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
  location: z.string().max(100).optional().or(z.literal('')),
  is_remote: z.boolean().default(true),
  application_url: HttpUrlSchema,
  deadline: z.string().optional().or(z.literal('')),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  is_published: z.boolean().default(true),
});

export type OpportunityInput = z.infer<typeof OpportunitySchema>;
