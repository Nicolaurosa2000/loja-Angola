import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product/product.service';
import { sendSuccess, sendCreated } from '../utils/api-response';
import { getPaginationMeta, getPaginationParams } from '../utils/pagination';

export class ProductController {
  private service: ProductService;

  constructor() {
    this.service = new ProductService();
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const filters = {
        page,
        limit,
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        brandId: req.query.brandId as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        isFeatured: req.query.isFeatured === 'true' ? true : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const { items, total } = await this.service.findAll(filters);
      sendSuccess(res, items, 'Success', 200, getPaginationMeta(total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.findById(req.params.id);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  };

  findBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.findBySlug(req.params.slug);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  };

  getFeatured = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.service.getFeatured();
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  };

  getBestSellers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.service.getBestSellers();
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  };

  findByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const { items, total } = await this.service.findByCategory(req.params.categoryId, page, limit);
      sendSuccess(res, items, 'Success', 200, getPaginationMeta(total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.create(req.body);
      sendCreated(res, product, 'Product created');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.update(req.params.id, req.body);
      sendSuccess(res, product, 'Product updated');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      sendSuccess(res, null, 'Product deleted');
    } catch (error) {
      next(error);
    }
  };
}
