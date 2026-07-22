import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING', 'AWAITING_PAYMENT', 'PAID', 'SEPARATING',
    'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED',
  ]),
  notes: z.string().optional(),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export const orderAdminQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type OrderAdminQueryInput = z.infer<typeof orderAdminQuerySchema>;
