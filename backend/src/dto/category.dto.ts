import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').max(100),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  image: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().nullable().optional(),
  image: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  metaTitle: z.string().max(60).nullable().optional(),
  metaDescription: z.string().max(160).nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
