import { BrandRepository } from '../../repositories/brand.repository';
import { AppError } from '../../middlewares';
import { generateSlug } from '../../helpers';

export class BrandService {
  private repository: BrandRepository;

  constructor() {
    this.repository = new BrandRepository();
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const brand = await this.repository.findById(id);
    if (!brand) throw new AppError('Brand not found', 404);
    return brand;
  }

  async create(data: { name: string; description?: string; logo?: string; website?: string }) {
    const slug = generateSlug(data.name);
    const existing = await this.repository.findBySlug(slug);
    if (existing) throw new AppError('Brand slug already exists', 409);

    return this.repository.create({
      name: data.name,
      slug,
      description: data.description,
      logo: data.logo,
      website: data.website,
    });
  }

  async update(id: string, data: { name?: string; description?: string; logo?: string; website?: string; isActive?: boolean }) {
    const brand = await this.repository.findById(id);
    if (!brand) throw new AppError('Brand not found', 404);

    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = generateSlug(data.name);
    }

    return this.repository.update(id, updateData);
  }

  async delete(id: string) {
    const brand = await this.repository.findById(id);
    if (!brand) throw new AppError('Brand not found', 404);
    return this.repository.softDelete(id);
  }

  async paginate(page: number, limit: number, search?: string) {
    return this.repository.paginate(page, limit, search);
  }
}
