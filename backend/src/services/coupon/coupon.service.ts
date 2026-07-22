import { prisma } from '../../config/database';
import { AppError } from '../../middlewares';
import { getPrismaPagination } from '../../utils/pagination';

export class CouponService {
  async create(data: {
    code: string;
    description?: string;
    type: string;
    value: number;
    minOrderValue?: number;
    maxUses?: number;
    maxUsesPerUser?: number;
    isActive?: boolean;
    startsAt?: string;
    expiresAt?: string;
  }) {
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code },
    });
    if (existing && !existing.deletedAt) throw new AppError('Coupon code already exists', 409);

    return prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        isActive: data.isActive ?? true,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  async update(
    id: string,
    data: {
      code?: string;
      description?: string;
      type?: string;
      value?: number;
      minOrderValue?: number;
      maxUses?: number;
      maxUsesPerUser?: number;
      isActive?: boolean;
      startsAt?: string;
      expiresAt?: string;
    }
  ) {
    const coupon = await prisma.coupon.findFirst({
      where: { id, deletedAt: null },
    });
    if (!coupon) throw new AppError('Coupon not found', 404);

    if (data.code) {
      const existing = await prisma.coupon.findUnique({
        where: { code: data.code },
      });
      if (existing && existing.id !== id) throw new AppError('Coupon code already exists', 409);
    }

    return prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  async findAll(params: { page: number; limit: number; search?: string; isActive?: string }) {
    const { page, limit, search, isActive } = params;
    const where: any = { deletedAt: null };

    if (search) {
      where.code = { contains: search };
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { skip, take } = getPrismaPagination(page, limit);

    const [items, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.coupon.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    const coupon = await prisma.coupon.findFirst({
      where: { id, deletedAt: null },
    });
    if (!coupon) throw new AppError('Coupon not found', 404);
    return coupon;
  }

  async delete(id: string) {
    const coupon = await prisma.coupon.findFirst({
      where: { id, deletedAt: null },
    });
    if (!coupon) throw new AppError('Coupon not found', 404);

    return prisma.coupon.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
