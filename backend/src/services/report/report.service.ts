import { prisma } from '../../config/database';

export class ReportService {
  async productSales(startDate?: string, endDate?: string) {
    try {
      const where: any = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const items = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, totalPrice: true },
        where: {
          order: { deletedAt: null, ...where },
        },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 50,
      });

      if (items.length === 0) return [];

      const productIds = items.map(i => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      });

      const productMap = new Map(products.map(p => [p.id, p]));

      return items.map(item => ({
        productId: item.productId,
        productName: productMap.get(item.productId)?.name ?? 'Unknown',
        sku: productMap.get(item.productId)?.sku ?? '',
        totalQuantity: item._sum.quantity ?? 0,
        totalRevenue: item._sum.totalPrice ?? 0,
      }));
    } catch (error) {
      return [];
    }
  }

  async customerOrders(startDate?: string, endDate?: string) {
    try {
      const where: any = { deletedAt: null };
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const result = await prisma.order.groupBy({
        by: ['userId'],
        _count: { id: true },
        _sum: { total: true },
        where,
        orderBy: { _sum: { total: 'desc' } },
        take: 50,
      });

      if (result.length === 0) return [];

      const userIds = result.map(r => r.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      });

      const userMap = new Map(users.map(u => [u.id, u]));

      return result.map(item => ({
        userId: item.userId,
        customerName: userMap.get(item.userId)?.name ?? 'Unknown',
        customerEmail: userMap.get(item.userId)?.email ?? '',
        totalOrders: item._count.id,
        totalSpent: item._sum.total ?? 0,
        averageOrderValue: item._count.id > 0 ? (item._sum.total ?? 0) / item._count.id : 0,
      }));
    } catch (error) {
      return [];
    }
  }

  async dailySales(startDate?: string, endDate?: string) {
    try {
      const where: any = { deletedAt: null, status: 'DELIVERED' };
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const orders = await prisma.order.findMany({
        where,
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const dailyMap = new Map<string, { revenue: number; orders: number }>();
      for (const order of orders) {
        const day = order.createdAt.toISOString().split('T')[0];
        const existing = dailyMap.get(day) || { revenue: 0, orders: 0 };
        existing.revenue += order.total;
        existing.orders += 1;
        dailyMap.set(day, existing);
      }

      return Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
        averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
      }));
    } catch (error) {
      return [];
    }
  }

  async paymentMethodBreakdown(startDate?: string, endDate?: string) {
    try {
      const where: any = { deletedAt: null, paymentMethod: { not: null } };
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const result = await prisma.order.groupBy({
        by: ['paymentMethod'],
        _count: { id: true },
        _sum: { total: true },
        where,
        orderBy: { _count: { id: 'desc' } },
      });

      return result.map(item => ({
        paymentMethod: item.paymentMethod,
        count: item._count.id,
        total: item._sum.total ?? 0,
      }));
    } catch (error) {
      return [];
    }
  }

  async stockReport() {
    try {
      const products = await prisma.product.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          minStock: true,
          price: true,
        },
      });

      const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
      const outOfStock = products.filter(p => p.stock === 0);
      const totalStockValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

      return {
        lowStock,
        outOfStock,
        totalStockValue,
        totalProducts: products.length,
      };
    } catch (error) {
      return { lowStock: [], outOfStock: [], totalStockValue: 0, totalProducts: 0 };
    }
  }
}
