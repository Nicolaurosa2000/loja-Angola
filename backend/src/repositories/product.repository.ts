import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  tags: true,
  category: true,
  brand: true,
  reviews: { where: { status: 'APPROVED', deletedAt: null }, take: 5 },
} satisfies Prisma.ProductInclude;

export class ProductRepository {
  async findById(id: string) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    });
  }

  async findBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: {
        ...productInclude,
        reviews: {
          where: { status: 'APPROVED', deletedAt: null },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data, include: productInclude });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data, include: productInclude });
  }

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async paginate(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, search, categoryId, brandId, minPrice, maxPrice, isFeatured, sortBy, sortOrder } = params;
    const where: Prisma.ProductWhereInput = { deletedAt: null, isActive: true, status: 'ACTIVE' };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
        { tags: { some: { name: { contains: search } } } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'price') orderBy.price = sortOrder || 'asc';
    else if (sortBy === 'name') orderBy.name = sortOrder || 'asc';
    else orderBy.createdAt = 'desc';

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          images: { where: { isCover: true }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async getFeatured(limit = 8) {
    return prisma.product.findMany({
      where: { isFeatured: true, isActive: true, status: 'ACTIVE', deletedAt: null },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isCover: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async getBestSellers(limit = 8) {
    return prisma.product.findMany({
      where: { isActive: true, status: 'ACTIVE', deletedAt: null },
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        images: { where: { isCover: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async findByCategory(categoryId: string, page: number, limit: number) {
    const where: Prisma.ProductWhereInput = {
      categoryId,
      isActive: true,
      status: 'ACTIVE',
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where: { ...where, deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { where: { isCover: true }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  }
}
