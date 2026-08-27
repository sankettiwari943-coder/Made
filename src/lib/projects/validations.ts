import { z } from 'zod';

export const PROJECT_CATEGORIES = [
  'AI / ML',
  'Web & Cloud',
  'Mobile',
  'Cybersecurity',
  'Hardware',
  'Design',
  'Research',
  'Systems & Compilers',
  'Other',
] as const;

export const PROJECT_STATUSES = [
  'IDEA',
  'BUILDING',
  'PROTOTYPE',
  'LIVE',
  'OPEN_SOURCE',
  'ARCHIVED',
] as const;

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base.slice(0, 80) || 'project';
}

const HttpUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL starting with http:// or https://' })
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'Only HTTP and HTTPS URLs are permitted.',
  })
  .optional()
  .or(z.literal(''));

export const ProjectSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Project title must be at least 2 characters.' })
    .max(100, { message: 'Project title cannot exceed 100 characters.' })
    .trim(),
  short_description: z
    .string()
    .min(10, { message: 'Short description must be at least 10 characters.' })
    .max(240, { message: 'Short description cannot exceed 240 characters.' })
    .trim(),
  description: z
    .string()
    .min(20, { message: 'Full description must be at least 20 characters.' })
    .trim(),
  category: z.string().min(2, { message: 'Please select a valid category.' }),
  status: z.enum(PROJECT_STATUSES, {
    errorMap: () => ({ message: 'Invalid project status.' }),
  }),
  technologies: z
    .array(z.string().min(1).max(40))
    .min(1, { message: 'Please specify at least one technology in your stack.' }),
  github_url: HttpUrlSchema,
  live_url: HttpUrlSchema,
  demo_url: HttpUrlSchema,
  is_public: z.boolean().default(true),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;

export const ProjectUpdateSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Update title must be at least 2 characters (e.g. Week 03: Milestone).' })
    .max(100, { message: 'Update title cannot exceed 100 characters.' })
    .trim(),
  content: z
    .string()
    .min(5, { message: 'Log content must be at least 5 characters.' })
    .max(5000, { message: 'Log content cannot exceed 5000 characters.' })
    .trim(),
});

export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;
