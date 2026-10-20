import { z } from 'zod';

/**
 * Sanitizes strings by stripping HTML tags and trimming whitespace
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .trim();
}

export const EventTypeEnum = z.enum([
  'wedding',
  'birthday',
  'corporate',
  'community',
  'anniversary',
  'graduation',
]);

export const BudgetCategoryEnum = z.enum([
  'venue',
  'catering',
  'decoration',
  'photography',
  'music',
  'transportation',
  'invitations',
  'attire',
  'gifts',
  'miscellaneous',
]);

export const PriorityEnum = z.enum(['high', 'medium', 'low']);

export const VendorStatusEnum = z.enum([
  'researching',
  'contacted',
  'quoted',
  'booked',
  'confirmed',
  'rejected',
]);

export const EventDetailsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).transform(sanitizeString),
  type: EventTypeEnum,
  date: z.string().optional().default(''),
  venue: z.string().max(150).optional().default('').transform(sanitizeString),
  guestCount: z.number().int().min(1).max(100000).default(50),
  totalBudget: z.number().min(0).max(100000000).default(10000),
  theme: z.string().max(100).optional().default('').transform(sanitizeString),
  description: z.string().max(1000).optional().default('').transform(sanitizeString),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'assistant']),
  parts: z
    .array(
      z.object({
        text: z.string().min(1).max(4000).transform(sanitizeString),
      })
    )
    .min(1),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(30),
  event: EventDetailsSchema.partial().optional(),
});

export const GenerateRequestSchema = z.object({
  type: z.enum(['timeline', 'budget', 'ideas']),
  event: EventDetailsSchema,
});

export const BudgetItemSchema = z.object({
  id: z.string().optional(),
  category: BudgetCategoryEnum,
  name: z.string().min(1).max(100).transform(sanitizeString),
  estimated: z.number().min(0),
  actual: z.number().min(0).default(0),
  notes: z.string().max(500).optional().default(''),
  paid: z.boolean().default(false),
});

export const TimelineItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(150).transform(sanitizeString),
  description: z.string().max(500).optional().default(''),
  dueDate: z.string().max(100).optional().default(''),
  completed: z.boolean().default(false),
  priority: PriorityEnum.default('medium'),
  category: z.string().max(50).default('general'),
});
