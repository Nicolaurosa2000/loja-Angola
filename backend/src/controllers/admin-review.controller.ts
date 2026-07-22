import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review/review.service';
import { sendSuccess } from '../utils/api-response';
import { getPaginationMeta, getPaginationParams } from '../utils/pagination';

export class AdminReviewController {
  private service: ReviewService;

  constructor() {
    this.service = new ReviewService();
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const { items, total } = await this.service.findAll({
        page,
        limit,
        status: req.query.status as string,
        productId: req.query.productId as string,
      });
      sendSuccess(res, items, 'Success', 200, getPaginationMeta(total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const review = await this.service.findById(req.params.id);
      sendSuccess(res, review);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const review = await this.service.updateStatus(req.params.id, req.body.status);
      sendSuccess(res, review, 'Review status updated');
    } catch (error) {
      next(error);
    }
  };
}
