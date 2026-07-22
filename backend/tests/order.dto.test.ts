import { describe, it, expect } from 'vitest';
import { createOrderSchema } from '../src/dto/order.dto';

describe('createOrderSchema', () => {
  it('accepts direct purchase items payload', () => {
    const result = createOrderSchema.safeParse({
      addressId: '11111111-1111-1111-1111-111111111111',
      paymentMethod: 'CASH_ON_DELIVERY',
      notes: 'Compra direta',
      items: [
        {
          productId: '22222222-2222-2222-2222-222222222222',
          quantity: 2,
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.success && result.data.items).toHaveLength(1);
  });
});
