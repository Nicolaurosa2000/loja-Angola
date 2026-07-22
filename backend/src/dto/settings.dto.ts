import { z } from 'zod';

export const createSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1),
  group: z.string().default('general'),
});

export const updateSettingSchema = z.object({
  value: z.string().min(1),
});

export type CreateSettingInput = z.infer<typeof createSettingSchema>;
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
