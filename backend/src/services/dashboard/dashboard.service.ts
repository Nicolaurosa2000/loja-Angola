import { prisma } from '../../config/database';

export class DashboardService {
  async getOverview(period = '30d') {
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalSales, totalOrders, totalCustomers, totalProducts, ordersInPeriod] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: { total: true },
          where: { deletedAt: null, status: 'DELIVERED' },
        }),
        prisma.order.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
        prisma.product.count({ where: { deletedAt: null } }),
        prisma.order.findMany({
          where: {
            createdAt: { gte: startDate },
            deletedAt: null,
            status: 'DELIVERED',
          },
          select: { total: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

    const totalRevenue = totalSales._sum.total ?? 0;

    const revenueByPeriod = this.groupByDay(ordersInPeriod, startDate);

    return {
      totalSales: totalOrders,
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue,
      revenueByPeriod,
    };
  }

  async recentOrders(limit = 10) {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: { deletedAt: null },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          take: 3,
          include: {
            product: { select: { id: true, name: true, images: { take: 1, select: { url: true } } } },
          },
        },
      },
    });
  }

  async topProducts(limit = 10) {
    const items = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: { productId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
      where: {
        order: { deletedAt: null },
      },
    });

    if (items.length === 0) return [];

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, images: { take: 1, select: { url: true } } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return items.map((item) => ({
      product: productMap.get(item.productId) || null,
      totalSold: item._sum.quantity ?? 0,
      orderCount: item._count.productId,
    }));
  }

  async salesByPeriod(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        deletedAt: null,
        status: 'DELIVERED',
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    return this.groupByDay(orders, start);
  }

  async revenueByStatus() {
    const statuses = ['PENDING', 'AWAITING_PAYMENT', 'PAID', 'SEPARATING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    const result: { status: string; count: number; total: number }[] = [];

    for (const status of statuses) {
      const agg = await prisma.order.aggregate({
        _sum: { total: true },
        _count: { id: true },
        where: { status, deletedAt: null },
      });

      result.push({
        status,
        count: agg._count.id,
        total: agg._sum.total ?? 0,
      });
    }

    return result;
  }

  private groupByDay(orders: { total: number; createdAt: Date }[], startDate: Date) {
    const map = new Map<string, number>();

    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      map.set(d.toISOString().split('T')[0], 0);
    }

    for (const order of orders) {
      const day = order.createdAt.toISOString().split('T')[0];
      map.set(day, (map.get(day) ?? 0) + order.total);
    }

    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
  }
}
