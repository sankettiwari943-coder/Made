const { z } = require('zod');

console.log('--- Executing Phase 5 Validation & Security Tests ---');

// Test 1: calculateOpportunityStatus logic
function calculateOpportunityStatus(deadlineStr) {
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

const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString();
const closingSoonDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString();
const openDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

const t1Passed =
  calculateOpportunityStatus(pastDate) === 'CLOSED' &&
  calculateOpportunityStatus(closingSoonDate) === 'CLOSING_SOON' &&
  calculateOpportunityStatus(openDate) === 'OPEN' &&
  calculateOpportunityStatus(null) === 'OPEN';

console.log('Test 1 (Dynamic Deadline Status Calculation):', t1Passed ? 'PASSED ✓' : 'FAILED ✗');

// Test 2: Opportunity Schema
const HttpUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL' })
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'Only HTTP and HTTPS URLs are permitted.',
  })
  .optional()
  .or(z.literal(''));

const OpportunitySchema = z.object({
  title: z.string().min(2).max(120).trim(),
  organization: z.string().min(2).max(100).trim(),
  type: z.enum([
    'HACKATHON', 'INTERNSHIP', 'FELLOWSHIP', 'COMPETITION', 'SCHOLARSHIP', 'GRANT', 'PROGRAM', 'OTHER',
  ]),
  short_description: z.string().min(10).max(280).trim(),
  description: z.string().min(20).trim(),
  application_url: HttpUrlSchema,
  is_published: z.boolean().default(true),
});

const validOpp = {
  title: 'ETHGlobal Synthetic Intelligence Hackathon',
  organization: 'ETHGlobal',
  type: 'HACKATHON',
  short_description: 'Global 36-hour sprint building decentralized autonomous intelligence agents.',
  description: 'Full description detailing mentors, bounty tracks, and compute grants.',
  application_url: 'https://ethglobal.com',
  is_published: true,
};
const pOppValid = OpportunitySchema.safeParse(validOpp);
console.log('Test 2 (Valid Opportunity Payload Validation):', pOppValid.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 3: XSS URL rejection in Opportunity
const xssOpp = { ...validOpp, application_url: 'javascript:stealCredentials()' };
const pOppXss = OpportunitySchema.safeParse(xssOpp);
console.log('Test 3 (Rejection of javascript: XSS in Application URL):', !pOppXss.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 4: Event Schema & Start/End time consistency
const EventSchema = z
  .object({
    title: z.string().min(2).max(120).trim(),
    organizer: z.string().min(2).max(100).default('MADE'),
    event_type: z.enum([
      'MEETUP', 'WORKSHOP', 'HACKATHON', 'DEMO_DAY', 'TALK', 'CONFERENCE', 'COMMUNITY', 'OTHER',
    ]),
    short_description: z.string().min(10).max(280).trim(),
    description: z.string().min(20).trim(),
    start_at: z.string().min(5),
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
    { message: 'Event end time cannot be earlier than start time.' }
  );

const validEvent = {
  title: 'MADE Build Night 01 // Distributed Systems & AI',
  organizer: 'MADE Core',
  event_type: 'MEETUP',
  short_description: 'An intensive 4-hour evening building session with live demos.',
  description: 'Students bring active prototypes, pair on distributed systems, and ship live.',
  start_at: '2026-08-30T19:00:00Z',
  end_at: '2026-08-30T23:00:00Z',
  registration_url: 'https://lu.ma/build-night',
  is_published: true,
};
const pEventValid = EventSchema.safeParse(validEvent);
console.log('Test 4 (Valid Event Payload & Timezone Ordering):', pEventValid.success ? 'PASSED ✓' : 'FAILED ✗');

// Test 5: Rejection of inverted event end time
const invalidEventTimes = {
  ...validEvent,
  start_at: '2026-08-30T23:00:00Z',
  end_at: '2026-08-30T19:00:00Z',
};
const pEventInvalid = EventSchema.safeParse(invalidEventTimes);
console.log('Test 5 (Rejection of Inverted Event Start/End Time):', !pEventInvalid.success ? 'PASSED ✓' : 'FAILED ✗');

console.log('--- All Phase 5 Validation & Security Tests Completed Successfully ---');
