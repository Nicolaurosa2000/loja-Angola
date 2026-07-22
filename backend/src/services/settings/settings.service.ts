import { prisma } from '../../config/database';
import { AppError } from '../../middlewares';

export class SettingsService {
  async findAll(group?: string) {
    const where: any = {};
    if (group) where.group = group;

    return prisma.setting.findMany({ where, orderBy: { key: 'asc' } });
  }

  async findById(id: string) {
    const setting = await prisma.setting.findUnique({ where: { id } });
    if (!setting) throw new AppError('Setting not found', 404);
    return setting;
  }

  async findByKey(key: string) {
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new AppError('Setting not found', 404);
    return setting;
  }

  async update(id: string, data: { value: string }) {
    const setting = await prisma.setting.findUnique({ where: { id } });
    if (!setting) throw new AppError('Setting not found', 404);

    return prisma.setting.update({ where: { id }, data });
  }

  async create(data: { key: string; value: string; group?: string }) {
    const existing = await prisma.setting.findUnique({ where: { key: data.key } });
    if (existing) throw new AppError('Setting key already exists', 409);

    return prisma.setting.create({
      data: {
        key: data.key,
        value: data.value,
        group: data.group ?? 'general',
      },
    });
  }
}
