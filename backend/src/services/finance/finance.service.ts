import { prisma } from "../../config/database";

export class FinanceService {
  async getOverview(period = "30d") {
    const startDate = this.getStartDate(period);

    const [
      completedOrders,
      pendingOrders,
      refundedOrders,
      paymentTransactions,
      paymentMethods,
    ] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          deletedAt: null,
          OR: [{ status: "DELIVERED" }, { paymentStatus: "PAID" }],
        },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          deletedAt: null,
          NOT: [
            { status: "DELIVERED" },
            { paymentStatus: "PAID" },
            { status: "CANCELLED" },
            { status: "REFUNDED" },
          ],
        },
        select: { total: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          deletedAt: null,
          OR: [{ status: "REFUNDED" }, { paymentStatus: "REFUNDED" }],
        },
        select: { total: true, createdAt: true },
      }),
      prisma.paymentTransaction.findMany({
        where: { createdAt: { gte: startDate } },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              paymentMethod: true,
              paymentStatus: true,
              status: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.order.groupBy({
        by: ["paymentMethod"],
        where: {
          createdAt: { gte: startDate },
          deletedAt: null,
          OR: [{ status: "DELIVERED" }, { paymentStatus: "PAID" }],
        },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );
    const pendingRevenue = pendingOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );
    const refundedAmount = refundedOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );
    const averageOrderValue =
      completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    return {
      totalRevenue,
      pendingRevenue,
      refundedAmount,
      averageOrderValue,
      transactionCount: paymentTransactions.length,
      paymentMethods: paymentMethods
        .filter((method) => method.paymentMethod)
        .map((method) => ({
          method: method.paymentMethod as string,
          amount: method._sum.total ?? 0,
          count: method._count.id,
        })),
      revenueByPeriod: this.groupByDay(completedOrders, startDate),
      recentTransactions: paymentTransactions,
    };
  }

  async getTransactions(limit = 10) {
    return prisma.paymentTransaction.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            paymentMethod: true,
            paymentStatus: true,
            status: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  private getStartDate(period: string) {
    const days = parseInt(period.replace("d", ""), 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return startDate;
  }

  private groupByDay(
    orders: { total: number; createdAt: Date }[],
    startDate: Date,
  ) {
    const map = new Map<string, number>();

    for (
      let d = new Date(startDate);
      d <= new Date();
      d.setDate(d.getDate() + 1)
    ) {
      map.set(d.toISOString().split("T")[0], 0);
    }

    for (const order of orders) {
      const day = order.createdAt.toISOString().split("T")[0];
      map.set(day, (map.get(day) ?? 0) + order.total);
    }

    return Array.from(map.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }
}
