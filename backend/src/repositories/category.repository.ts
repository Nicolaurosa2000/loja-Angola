import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class CategoryRepository {
  async findAll(includeDeleted = false) {
    const where: Prisma.CategoryWhereInput = includeDeleted ? {} : { deletedAt: null };
    return prisma.category.findMany({
      where,
      include: { children: true, parent: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: { children: true, parent: true },
    });
  }

  async findBySlug(slug: string) {
    return prisma.category.findFirst({
      where: { slug, deletedAt: null },
      include: { children: true, parent: true },
    });
  }

  async create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async paginate(page: number, limit: number, search?: string) {
    const where: Prisma.CategoryWhereInput = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: { parent: true, _count: { select: { products: true, children: true } } },
      }),
      prisma.category.count({ where }),
    ]);

    return { items, total };
  }

  async findRootCategories() {
    return prisma.category.findMany({
      where: { parentId: null, deletedAt: null },
      include: {
        children: { where: { deletedAt: null }, include: { children: true } },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
