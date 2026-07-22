import { prisma } from '../../config/database';
import { AppError } from '../../middlewares';
import { getPrismaPagination } from '../../utils/pagination';

export class ReviewService {
  async findAll(params: { page: number; limit: number; status?: string; productId?: string }) {
    const { page, limit, status, productId } = params;
    const where: any = { deletedAt: null };

    if (status) where.status = status;
    if (productId) where.productId = productId;

    const { skip, take } = getPrismaPagination(page, limit);

    const [items, total] = await Promise.all([
      prisma.productReview.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          product: { select: { id: true, name: true, images: { take: 1, select: { url: true } } } },
        },
      }),
      prisma.productReview.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    const review = await prisma.productReview.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        product: { select: { id: true, name: true, price: true, images: { take: 1, select: { url: true } } } },
      },
    });
    if (!review) throw new AppError('Review not found', 404);
    return review;
  }

  async updateStatus(id: string, status: string) {
    const review = await prisma.productReview.findFirst({
      where: { id, deletedAt: null },
    });
    if (!review) throw new AppError('Review not found', 404);

    return prisma.productReview.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });
  }
}
