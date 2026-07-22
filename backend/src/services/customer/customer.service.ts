import { UserRepository } from '../../repositories/user.repository';
import { prisma } from '../../config/database';
import { AppError } from '../../middlewares';

export class CustomerService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async findAll(params: { page: number; limit: number; search?: string; isActive?: string }) {
    const { page, limit, search, isActive } = params;

    const where: any = { deletedAt: null, role: 'CUSTOMER' };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          isActive: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    const customer = await prisma.user.findFirst({
      where: { id, deletedAt: null, role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        isActive: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true, reviews: true } },
      },
    });
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  }

  async toggleActive(id: string) {
    const customer = await prisma.user.findFirst({
      where: { id, deletedAt: null, role: 'CUSTOMER' },
    });
    if (!customer) throw new AppError('Customer not found', 404);

    return prisma.user.update({
      where: { id },
      data: { isActive: !customer.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });
  }
}
