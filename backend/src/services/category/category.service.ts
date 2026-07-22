import { CategoryRepository } from '../../repositories/category.repository';
import { AppError } from '../../middlewares';
import { generateSlug } from '../../helpers';

export class CategoryService {
  private repository: CategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }

  async findAll() {
    return this.repository.findRootCategories();
  }

  async findById(id: string) {
    const category = await this.repository.findById(id);
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.repository.findBySlug(slug);
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  async create(data: { name: string; description?: string; parentId?: string; image?: string; metaTitle?: string; metaDescription?: string }) {
    const slug = generateSlug(data.name);

    const existing = await this.repository.findBySlug(slug);
    if (existing) throw new AppError('Category slug already exists', 409);

    const createData: any = {
      name: data.name,
      slug,
      description: data.description,
      image: data.image,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    };

    if (data.parentId) {
      createData.parent = { connect: { id: data.parentId } };
    }

    return this.repository.create(createData);
  }

  async update(id: string, data: { name?: string; description?: string; parentId?: string; image?: string; isActive?: boolean; sortOrder?: number; metaTitle?: string; metaDescription?: string }) {
    const category = await this.repository.findById(id);
    if (!category) throw new AppError('Category not found', 404);

    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = generateSlug(data.name);
    }

    return this.repository.update(id, updateData);
  }

  async delete(id: string) {
    const category = await this.repository.findById(id);
    if (!category) throw new AppError('Category not found', 404);
    return this.repository.softDelete(id);
  }

  async paginate(page: number, limit: number, search?: string) {
    return this.repository.paginate(page, limit, search);
  }
}
