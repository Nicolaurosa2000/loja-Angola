import { AddressRepository } from '../../repositories/address.repository';
import { AppError } from '../../middlewares';

export class AddressService {
  private repository: AddressRepository;

  constructor() {
    this.repository = new AddressRepository();
  }

  async findAll(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async findById(id: string, userId: string) {
    const address = await this.repository.findById(id);
    if (!address) throw new AppError('Address not found', 404);
    if (address.userId !== userId) throw new AppError('Unauthorized', 403);
    return address;
  }

  async create(userId: string, data: {
    label?: string;
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    city: string;
    province: string;
    zipCode?: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await this.repository.unsetDefaultByUser(userId);
    }

    return this.repository.create({
      ...data,
      user: { connect: { id: userId } },
    });
  }

  async update(id: string, userId: string, data: {
    label?: string;
    street?: string;
    number?: string | null;
    complement?: string | null;
    neighborhood?: string;
    city?: string;
    province?: string;
    zipCode?: string | null;
    isDefault?: boolean;
  }) {
    const address = await this.repository.findById(id);
    if (!address) throw new AppError('Address not found', 404);
    if (address.userId !== userId) throw new AppError('Unauthorized', 403);

    if (data.isDefault) {
      await this.repository.unsetDefaultByUser(userId);
    }

    return this.repository.update(id, data);
  }

  async delete(id: string, userId: string) {
    const address = await this.repository.findById(id);
    if (!address) throw new AppError('Address not found', 404);
    if (address.userId !== userId) throw new AppError('Unauthorized', 403);

    return this.repository.softDelete(id);
  }
}
