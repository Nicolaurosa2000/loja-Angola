import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url().optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
