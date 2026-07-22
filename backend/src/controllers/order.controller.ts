import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order/order.service';
import { sendSuccess, sendCreated } from '../utils/api-response';
import { getPaginationMeta, getPaginationParams } from '../utils/pagination';

export class OrderController {
  private service: OrderService;

  constructor() {
    this.service = new OrderService();
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { page, limit } = getPaginationParams(req.query as any);
      const { items, total } = await this.service.findAll(userId, page, limit);
      sendSuccess(res, items, 'Success', 200, getPaginationMeta(total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const order = await this.service.findById(req.params.id, userId);
      sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const order = await this.service.create(userId, req.body);
      sendCreated(res, order, 'Order created successfully');
    } catch (error) {
      next(error);
    }
  };

  uploadProof = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const result = await this.service.uploadProof(userId, req.params.id, req.file);
      sendSuccess(res, result, 'Proof uploaded successfully');
    } catch (error) {
      next(error);
    }
  };
}
