import { z } from 'zod';

export const newsletterQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  isActive: z.string().optional(),
});

export type NewsletterQueryInput = z.infer<typeof newsletterQuerySchema>;
