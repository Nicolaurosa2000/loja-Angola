import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(['MULTICAIXA_EXPRESS', 'CASH_ON_DELIVERY']),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).optional(),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
