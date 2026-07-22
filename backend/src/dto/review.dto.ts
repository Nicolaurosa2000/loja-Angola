import { z } from 'zod';

export const updateReviewStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  productId: z.string().uuid().optional(),
});

export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;
