import { prisma } from '../../config/database';
import { AppError } from '../../middlewares';
import { generateSlug } from '../../helpers';

export class ProductService {
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
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.brandId && { brandId: filters.brandId }),
      ...(filters.isFeatured !== undefined && { isFeatured: filters.isFeatured }),
      ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
        price: {
          ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
          ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
        },
      }),
    };

    const orderBy = filters.sortBy
      ? { [filters.sortBy]: filters.sortOrder || 'asc' }
      : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          images: true,
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async findBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        category: true,
        brand: true,
        tags: true,
      },
    });

    if (!product || product.deletedAt) throw new AppError('Product not found', 404);
    return product;
  }

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        brand: true,
        tags: true,
      },
    });

    if (!product || product.deletedAt) throw new AppError('Product not found', 404);
    return product;
  }

  async getFeatured(limit = 8) {
    try {
      return await prisma.product.findMany({
        where: {
          isFeatured: true,
          deletedAt: null,
        },
        take: Number(limit) || 8,
        include: {
          images: {
            take: 1,
            select: { id: true, url: true, isCover: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      return [];
    }
  }

  async getBestSellers(limit = 8) {
    try {
      return await prisma.product.findMany({
        where: { deletedAt: null },
        take: Number(limit) || 8,
        include: {
          images: {
            take: 1,
            select: { id: true, url: true, isCover: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Erro ao buscar os mais vendidos:', error);
      return [];
    }
  }

  async findByCategory(categoryId: string, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const where = { categoryId, deletedAt: null };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip,
        include: {
          images: true,
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
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

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) throw new AppError('Product slug already exists', 409);

    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) throw new AppError('Product SKU already exists', 409);

    return prisma.product.create({
      data: {
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
        tags: data.tags
          ? {
              create: data.tags.map((name) => ({ name })),
            }
          : undefined,
        images: data.images
          ? {
              create: data.images.map((img, i) => ({
                url: img.url,
                alt: img.alt,
                isCover: img.isCover || i === 0,
                sortOrder: img.sortOrder || i,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        category: true,
        tags: true,
      },
    });
  }

  async update(id: string, data: any) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.deletedAt) throw new AppError('Product not found', 404);

    const updateData: any = { ...data };
    delete updateData.tags;
    delete updateData.images;

    if (data.name) {
      updateData.slug = generateSlug(data.name);
    }

    if (data.tags) {
      await prisma.productTag.deleteMany({ where: { productId: id } });
      updateData.tags = {
        create: data.tags.map((name: string) => ({ name })),
      };
    }

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

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        category: true,
        tags: true,
      },
    });
  }

  async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.deletedAt) throw new AppError('Product not found', 404);

    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}