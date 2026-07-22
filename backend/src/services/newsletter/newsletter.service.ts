import { prisma } from '../../config/database';
import { AppError } from '../../middlewares';
import { getPrismaPagination } from '../../utils/pagination';

export class NewsletterService {
  async findAll(params: { page: number; limit: number; isActive?: string }) {
    const { page, limit, isActive } = params;
    const where: any = { deletedAt: null };

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { skip, take } = getPrismaPagination(page, limit);

    const [items, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: { id, deletedAt: null },
    });
    if (!subscriber) throw new AppError('Subscriber not found', 404);
    return subscriber;
  }

  async delete(id: string) {
    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: { id, deletedAt: null },
    });
    if (!subscriber) throw new AppError('Subscriber not found', 404);

    return prisma.newsletterSubscriber.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
