import { prisma } from '../../config/database';
import { AppError } from '../../middlewares';
import { getPrismaPagination } from '../../utils/pagination';

export class BannerService {
  async findAll(params: { page: number; limit: number; isActive?: string }) {
    const { page, limit, isActive } = params;
    const where: any = { deletedAt: null };

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { skip, take } = getPrismaPagination(page, limit);

    const [items, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        skip,
        take,
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.banner.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    const banner = await prisma.banner.findFirst({
      where: { id, deletedAt: null },
    });
    if (!banner) throw new AppError('Banner not found', 404);
    return banner;
  }

  async create(data: {
    title?: string;
    subtitle?: string;
    image: string;
    link?: string;
    position?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        image: data.image,
        link: data.link,
        position: data.position ?? 'HERO',
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      subtitle?: string;
      image?: string;
      link?: string;
      position?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ) {
    const banner = await prisma.banner.findFirst({
      where: { id, deletedAt: null },
    });
    if (!banner) throw new AppError('Banner not found', 404);

    return prisma.banner.update({ where: { id }, data });
  }

  async delete(id: string) {
    const banner = await prisma.banner.findFirst({
      where: { id, deletedAt: null },
    });
    if (!banner) throw new AppError('Banner not found', 404);

    return prisma.banner.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
