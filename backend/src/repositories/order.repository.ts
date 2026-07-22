import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

const orderInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { where: { isCover: true }, take: 1 },
        },
      },
    },
  },
  address: true,
  payments: true,
} satisfies Prisma.OrderInclude;

export class OrderRepository {
  async findById(id: string) {
    return prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: orderInclude,
    });
  }

  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findFirst({
      where: { orderNumber, deletedAt: null },
      include: orderInclude,
    });
  }

  async findByUserId(userId: string, page = 1, limit = 10) {
    const where: Prisma.OrderWhereInput = { userId, deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          address: true,
        },
      }),
      prisma.order.count({ where }),
    ]);
    return { items, total };
  }

  async create(data: Prisma.OrderCreateInput) {
    return prisma.order.create({ data, include: orderInclude });
  }

  async update(id: string, data: Prisma.OrderUpdateInput) {
    return prisma.order.update({ where: { id }, data, include: orderInclude });
  }

  async softDelete(id: string) {
    return prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAllAdmin(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, search, status, paymentStatus, startDate, endDate } = params;
    const where: Prisma.OrderWhereInput = { deletedAt: null };

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
            },
          },
          address: true,
          payments: true,
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total };
  }

  async findByIdAdmin(id: string) {
    return prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              include: {
                images: { where: { isCover: true }, take: 1 },
              },
            },
          },
        },
        address: true,
        payments: true,
        discounts: { include: { coupon: true } },
      },
    });
  }

  async createItem(data: Prisma.OrderItemCreateInput) {
    return prisma.orderItem.create({ data });
  }

  async createTransaction(data: Prisma.PaymentTransactionCreateInput) {
    return prisma.paymentTransaction.create({ data });
  }

  async updatePayment(id: string, data: {
    paymentStatus: string;
    paidAt?: Date;
    transactionId?: string;
  }) {
    return prisma.order.update({
      where: { id },
      data: {
        paymentStatus: data.paymentStatus,
        paidAt: data.paidAt,
      },
      include: orderInclude,
    });
  }

  async updateTransaction(orderId: string, data: Prisma.PaymentTransactionUpdateInput) {
    return prisma.paymentTransaction.updateMany({
      where: { orderId },
      data,
    });
  }
}
