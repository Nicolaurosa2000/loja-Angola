import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  period: z.string().default('30d'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
