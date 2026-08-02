import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { where: { isCover: true }, take: 1 },
        },
      },
    },
  },
  coupon: true,
} satisfies Prisma.CartInclude;

export class CartRepository {
  async findByUserId(userId: string) {
    return prisma.cart.findFirst({
      where: { userId },
      include: cartInclude,
    });
  }

  async findBySessionId(sessionId: string) {
    return prisma.cart.findFirst({
      where: { sessionId },
      include: cartInclude,
    });
  }

  async findById(id: string) {
    return prisma.cart.findFirst({
      where: { id },
      include: cartInclude,
    });
  }

  async create(data: Prisma.CartCreateInput) {
    return prisma.cart.create({ data, include: cartInclude });
  }

  async update(id: string, data: Prisma.CartUpdateInput) {
    return prisma.cart.update({ where: { id }, data, include: cartInclude });
  }

  async delete(id: string) {
    await prisma.cartItem.deleteMany({ where: { cartId: id } });
    return prisma.cart.delete({ where: { id } });
  }

  async addItem(cartId: string, productId: string, quantity: number) {
    const existing = await prisma.cartItem.findFirst({ where: { cartId, productId } });
    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    }
    return prisma.cartItem.create({ data: { cartId, productId, quantity } });
  }

  async updateItemQuantity(itemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(itemId: string) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  }

  async applyCoupon(cartId: string, couponId: string) {
    return prisma.cart.update({
      where: { id: cartId },
      data: { couponId },
      include: cartInclude,
    });
  }

  async removeCoupon(cartId: string) {
    return prisma.cart.update({
      where: { id: cartId },
      data: { couponId: null },
      include: cartInclude,
    });
  }
}
