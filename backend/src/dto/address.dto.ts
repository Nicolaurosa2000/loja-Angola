import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  province: z.string().min(1, 'Província é obrigatória'),
  zipCode: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1).optional(),
  number: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  province: z.string().min(1).optional(),
  zipCode: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
