import { prisma } from '../config/database';

export class WishlistRepository {
  async findByUserId(userId: string) {
    return prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { where: { isCover: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.wishlistItem.findFirst({
      where: { id },
      include: {
        product: {
          include: {
            images: { where: { isCover: true }, take: 1 },
          },
        },
      },
    });
  }

  async findByUserAndProduct(userId: string, productId: string) {
    return prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });
  }

  async create(userId: string, productId: string) {
    return prisma.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: {
          include: {
            images: { where: { isCover: true }, take: 1 },
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.wishlistItem.delete({ where: { id } });
  }

  async deleteByUserAndProduct(userId: string, productId: string) {
    return prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });
  }

  async count(userId: string) {
    return prisma.wishlistItem.count({ where: { userId } });
  }
}
