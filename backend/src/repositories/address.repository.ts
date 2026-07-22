import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class AddressRepository {
  async findByUserId(userId: string) {
    return prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    return prisma.address.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(data: Prisma.AddressCreateInput) {
    return prisma.address.create({ data });
  }

  async update(id: string, data: Prisma.AddressUpdateInput) {
    return prisma.address.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.address.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async unsetDefaultByUser(userId: string) {
    return prisma.address.updateMany({
      where: { userId, isDefault: true, deletedAt: null },
      data: { isDefault: false },
    });
  }
}
