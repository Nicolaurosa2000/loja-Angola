import { prisma } from '../../config/database';
import { UserRepository } from '../../repositories/user.repository';
import { AppError } from '../../middlewares';
import { getPrismaPagination } from '../../utils/pagination';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async findAll(params: { page: number; limit: number; search?: string; role?: string }) {
    const { page, limit, search, role } = params;
    const where: any = { deletedAt: null };

    if (role) {
      where.role = role;
    } else {
      where.role = { in: ['ADMIN', 'STAFF'] };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const { skip, take } = getPrismaPagination(page, limit);

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
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
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) {
    const existing = await this.repository.findByEmail(data.email);
    if (existing) throw new AppError('Email already in use', 409);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role ?? 'STAFF',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      isActive?: boolean;
    }
  ) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) throw new AppError('User not found', 404);

    if (data.email && data.email !== user.email) {
      const existing = await this.repository.findByEmail(data.email);
      if (existing) throw new AppError('Email already in use', 409);
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async toggleActive(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) throw new AppError('User not found', 404);

    return prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

  async delete(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) throw new AppError('User not found', 404);

    return this.repository.softDelete(id);
  }
}
