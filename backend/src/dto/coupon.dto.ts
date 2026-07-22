import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(1).max(50).transform(v => v.toUpperCase()),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive(),
  minOrderValue: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const couponQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: z.string().optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type CouponQueryInput = z.infer<typeof couponQuerySchema>;
