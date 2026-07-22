import { z } from 'zod';

export const createBannerSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().min(1),
  link: z.string().optional(),
  position: z.string().default('HERO'),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateBannerSchema = createBannerSchema.partial();

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
