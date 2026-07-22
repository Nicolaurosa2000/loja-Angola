import { describe, expect, it } from "vitest";
import {
  createProductSchema,
  updateProductSchema,
} from "../src/dto/product.dto";

describe("product validation", () => {
  it("accepts relative image URLs for create payloads", () => {
    const result = createProductSchema.safeParse({
      name: "Produto teste",
      description: "Descrição válida do produto",
      price: 100,
      sku: "SKU-1",
      categoryId: "550e8400-e29b-41d4-a716-446655440000",
      images: [{ url: "/uploads/test.png", isCover: true, sortOrder: 0 }],
    });

    expect(result.success).toBe(true);
  });

  it("accepts relative image URLs for update payloads", () => {
    const result = updateProductSchema.safeParse({
      name: "Produto atualizado",
      price: 120,
      images: [{ url: "/uploads/test.png", isCover: true, sortOrder: 0 }],
    });

    expect(result.success).toBe(true);
  });
});
