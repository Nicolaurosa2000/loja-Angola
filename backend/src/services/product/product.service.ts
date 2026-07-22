import { prisma } from '../../config/database';
import { ProductRepository } from '../../repositories/product.repository';
import { AppError } from '../../middlewares';
import { generateSlug } from '../../helpers';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    return this.repository.paginate({
      page: filters.page || 1,
      limit: filters.limit || 12,
      search: filters.search,
      categoryId: filters.categoryId,
      brandId: filters.brandId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      isFeatured: filters.isFeatured,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  }

  async findBySlug(slug: string) {
    const product = await this.repository.findBySlug(slug);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async findById(id: string) {
    const product = await this.repository.findById(id);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async getFeatured(limit = 8) {
    return this.repository.getFeatured(limit);
  }

  async getBestSellers(limit = 8) {
    return this.repository.getBestSellers(limit);
  }

  async findByCategory(categoryId: string, page = 1, limit = 12) {
    return this.repository.findByCategory(categoryId, page, limit);
  }

  async create(data: {
    name: string;
    description: string;
    price: number;
    sku: string;
    categoryId: string;
    fullDescription?: string;
    promotionalPrice?: number;
    code?: string;
    weight?: number;
    stock?: number;
    isFeatured?: boolean;
    status?: string;
    brandId?: string;
    metaTitle?: string;
    metaDescription?: string;
    videoUrl?: string;
    tags?: string[];
    images?: { url: string; alt?: string; isCover?: boolean; sortOrder?: number }[];
  }) {
    const slug = generateSlug(data.name);

    const existingSlug = await this.repository.findBySlug(slug);
    if (existingSlug) throw new AppError('Product slug already exists', 409);

    const existingSku = await this.repository.findBySlug(data.sku);
    if (existingSku) throw new AppError('Product SKU already exists', 409);

    return this.repository.create({
      name: data.name,
      slug,
      description: data.description,
      fullDescription: data.fullDescription,
      price: data.price,
      promotionalPrice: data.promotionalPrice,
      sku: data.sku,
      code: data.code,
      weight: data.weight,
      stock: data.stock || 0,
      isFeatured: data.isFeatured || false,
      status: data.status || 'ACTIVE',
      category: { connect: { id: data.categoryId } },
      brand: data.brandId ? { connect: { id: data.brandId } } : undefined,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      videoUrl: data.videoUrl,
      tags: data.tags ? {
        create: data.tags.map((name) => ({ name })),
      } : undefined,
      images: data.images ? {
        create: data.images.map((img, i) => ({
          url: img.url,
          alt: img.alt,
          isCover: img.isCover || i === 0,
          sortOrder: img.sortOrder || i,
        })),
      } : undefined,
    });
  }

  async update(id: string, data: any) {
    const product = await this.repository.findById(id);
    if (!product) throw new AppError('Product not found', 404);

    const updateData: any = { ...data };
    delete updateData.tags;
    delete updateData.images;

    if (data.name) {
      updateData.slug = generateSlug(data.name);
    }

    // Handle tag updates
    if (data.tags) {
      await prisma.productTag.deleteMany({ where: { productId: id } });
      updateData.tags = {
        create: data.tags.map((name: string) => ({ name })),
      };
    }

    // Handle image updates
    if (data.images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      updateData.images = {
        create: data.images.map((img: any, i: number) => ({
          url: img.url,
          alt: img.alt,
          isCover: img.isCover || i === 0,
          sortOrder: img.sortOrder || i,
        })),
      };
    }

    return this.repository.update(id, updateData);
  }

  async delete(id: string) {
    const product = await this.repository.findById(id);
    if (!product) throw new AppError('Product not found', 404);
    return this.repository.softDelete(id);
  }
}
