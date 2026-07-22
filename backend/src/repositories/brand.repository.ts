import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class BrandRepository {
  async findAll() {
    return prisma.brand.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.brand.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { products: true } } },
    });
  }

  async findBySlug(slug: string) {
    return prisma.brand.findFirst({
      where: { slug, deletedAt: null },
    });
  }

  async create(data: Prisma.BrandCreateInput) {
    return prisma.brand.create({ data });
  }

  async update(id: string, data: Prisma.BrandUpdateInput) {
    return prisma.brand.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async paginate(page: number, limit: number, search?: string) {
    const where: Prisma.BrandWhereInput = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      prisma.brand.count({ where }),
    ]);

    return { items, total };
  }
}
