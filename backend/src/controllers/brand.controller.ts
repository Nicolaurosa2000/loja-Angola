import { Request, Response, NextFunction } from 'express';
import { BrandService } from '../services/brand/brand.service';
import { sendSuccess, sendCreated } from '../utils/api-response';
import { getPaginationMeta, getPaginationParams } from '../utils/pagination';

export class BrandController {
  private service: BrandService;

  constructor() {
    this.service = new BrandService();
  }

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const brands = await this.service.findAll();
      sendSuccess(res, brands);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const brand = await this.service.findById(req.params.id);
      sendSuccess(res, brand);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const brand = await this.service.create(req.body);
      sendCreated(res, brand, 'Brand created');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const brand = await this.service.update(req.params.id, req.body);
      sendSuccess(res, brand, 'Brand updated');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      sendSuccess(res, null, 'Brand deleted');
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
