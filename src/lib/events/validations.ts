import { z } from 'zod';
import { EventType, EventRsvpStatus } from '../supabase/types';

export const EVENT_TYPES: EventType[] = [
  'MEETUP',
  'WORKSHOP',
  'HACKATHON',
  'DEMO_DAY',
  'TALK',
  'CONFERENCE',
  'COMMUNITY',
  'OTHER',
];

export const EVENT_RSVP_STATUSES: EventRsvpStatus[] = ['GOING', 'MAYBE', 'NOT_GOING'];

const HttpUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL starting with http:// or https://' })
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'Only HTTP and HTTPS URLs are permitted.',
  })
  .optional()
  .or(z.literal(''));

export const EventSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: 'Title must be at least 2 characters.' })
      .max(120, { message: 'Title cannot exceed 120 characters.' })
      .trim(),
    organizer: z
      .string()
      .min(2, { message: 'Organizer name is required.' })
      .max(100)
      .default('MADE'),
    event_type: z.enum([
      'MEETUP',
      'WORKSHOP',
      'HACKATHON',
      'DEMO_DAY',
      'TALK',
      'CONFERENCE',
      'COMMUNITY',
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
    location: z.string().max(120).optional().or(z.literal('')),
    is_remote: z.boolean().default(true),
    start_at: z.string().min(5, { message: 'Start date and time are required.' }),
    end_at: z.string().optional().or(z.literal('')),
    registration_url: HttpUrlSchema,
    is_published: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (!data.end_at || !data.start_at) return true;
      const start = new Date(data.start_at);
      const end = new Date(data.end_at);
      return end >= start;
    },
    {
      message: 'Event end time cannot be earlier than start time.',
      path: ['end_at'],
    }
  );

export type EventInput = z.infer<typeof EventSchema>;
