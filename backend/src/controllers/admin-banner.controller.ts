import { Request, Response, NextFunction } from 'express';
import { BannerService } from '../services/banner/banner.service';
import { sendSuccess, sendCreated } from '../utils/api-response';
import { getPaginationMeta, getPaginationParams } from '../utils/pagination';

export class AdminBannerController {
  private service: BannerService;

  constructor() {
    this.service = new BannerService();
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const { items, total } = await this.service.findAll({
        page,
        limit,
        isActive: req.query.isActive as string,
      });
      sendSuccess(res, items, 'Success', 200, getPaginationMeta(total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const banner = await this.service.findById(req.params.id);
      sendSuccess(res, banner);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const banner = await this.service.create(req.body);
      sendCreated(res, banner, 'Banner created');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const banner = await this.service.update(req.params.id, req.body);
      sendSuccess(res, banner, 'Banner updated');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      sendSuccess(res, null, 'Banner deleted');
    } catch (error) {
      next(error);
    }
  };
}
