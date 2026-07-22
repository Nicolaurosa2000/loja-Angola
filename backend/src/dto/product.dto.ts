import { z } from "zod";

const imageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) return false;
      if (
        value.startsWith("/") ||
        value.startsWith("./") ||
        value.startsWith("../")
      )
        return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "URL de imagem inválida" },
  );

const baseProductSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
  fullDescription: z.string().optional(),
  price: z.number().positive("Preço deve ser positivo"),
  promotionalPrice: z.number().positive().optional().nullable(),
  sku: z.string().min(1).max(50),
  code: z.string().optional(),
  weight: z.number().positive().optional().nullable(),
  length: z.number().positive().optional().nullable(),
  width: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).default("ACTIVE"),
  categoryId: z.string().uuid("Categoria inválida"),
  brandId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => undefined)),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  videoUrl: z
    .string()
    .url()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => undefined)),
  tags: z.array(z.string()).optional().default([]),
  images: z
    .array(
      z.object({
        url: imageUrlSchema,
        alt: z.string().optional(),
        isCover: z.boolean().default(false),
        sortOrder: z.number().int().default(0),
      }),
    )
    .optional()
    .default([]),
});

export const createProductSchema = baseProductSchema.refine(
  (data) => !data.promotionalPrice || data.promotionalPrice < data.price,
  {
    message: "Preço promocional deve ser menor que o preço normal",
    path: ["promotionalPrice"],
  },
);

export const updateProductSchema = baseProductSchema
  .partial()
  .refine(
    (data) =>
      !data.promotionalPrice ||
      !data.price ||
      data.promotionalPrice < data.price,
    {
      message: "Preço promocional deve ser menor que o preço normal",
      path: ["promotionalPrice"],
    },
  );

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sortBy: z.enum(["price", "name", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
