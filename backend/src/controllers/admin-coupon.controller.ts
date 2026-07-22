import { Request, Response, NextFunction } from 'express';
import { CouponService } from '../services/coupon/coupon.service';
import { sendSuccess, sendCreated } from '../utils/api-response';
import { getPaginationMeta, getPaginationParams } from '../utils/pagination';

export class AdminCouponController {
  private service: CouponService;

  constructor() {
    this.service = new CouponService();
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const { items, total } = await this.service.findAll({
        page,
        limit,
        search: req.query.search as string,
        isActive: req.query.isActive as string,
      });
      sendSuccess(res, items, 'Success', 200, getPaginationMeta(total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupon = await this.service.findById(req.params.id);
      sendSuccess(res, coupon);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupon = await this.service.create(req.body);
      sendCreated(res, coupon, 'Coupon created');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupon = await this.service.update(req.params.id, req.body);
      sendSuccess(res, coupon, 'Coupon updated');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      sendSuccess(res, null, 'Coupon deleted');
    } catch (error) {
      next(error);
    }
  };
}
