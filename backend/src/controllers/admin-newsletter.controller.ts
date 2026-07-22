import { Request, Response, NextFunction } from 'express';
import { NewsletterService } from '../services/newsletter/newsletter.service';
import { sendSuccess } from '../utils/api-response';
import { getPaginationMeta, getPaginationParams } from '../utils/pagination';

export class AdminNewsletterController {
  private service: NewsletterService;

  constructor() {
    this.service = new NewsletterService();
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
      const subscriber = await this.service.findById(req.params.id);
      sendSuccess(res, subscriber);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      sendSuccess(res, null, 'Subscriber deleted');
    } catch (error) {
      next(error);
    }
  };
}
