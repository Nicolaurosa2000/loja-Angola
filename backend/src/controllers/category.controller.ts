import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category/category.service';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/api-response';
import { getPaginationMeta, getPaginationParams } from '../utils/pagination';

export class CategoryController {
  private service: CategoryService;

  constructor() {
    this.service = new CategoryService();
  }

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.findAll();
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  };

  findBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.findBySlug(req.params.slug);
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.findById(req.params.id);
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.create(req.body);
      sendCreated(res, category, 'Category created');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.update(req.params.id, req.body);
      sendSuccess(res, category, 'Category updated');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      sendSuccess(res, null, 'Category deleted');
    } catch (error) {
      next(error);
    }
  };

  paginate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const { items, total } = await this.service.paginate(page, limit, req.query.search as string);
      sendSuccess(res, items, 'Success', 200, getPaginationMeta(total, page, limit));
    } catch (error) {
      next(error);
    }
  };
}
