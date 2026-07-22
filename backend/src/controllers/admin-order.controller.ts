import { Request, Response, NextFunction } from 'express';
import { AdminOrderService } from '../services/order/admin-order.service';
import { sendSuccess } from '../utils/api-response';
import { getPaginationMeta, getPaginationParams } from '../utils/pagination';

export class AdminOrderController {
  private service: AdminOrderService;

  constructor() {
    this.service = new AdminOrderService();
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const filters = {
        page,
        limit,
        search: req.query.search as string,
        status: req.query.status as string,
        paymentStatus: req.query.paymentStatus as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const { items, total } = await this.service.findAll(filters);
      sendSuccess(res, items, 'Success', 200, getPaginationMeta(total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.service.findById(req.params.id);
      sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.service.updateStatus(req.params.id, req.body);
      sendSuccess(res, order, 'Order status updated');
    } catch (error) {
      next(error);
    }
  };

  updatePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.service.updatePayment(req.params.id, req.body);
      sendSuccess(res, order, 'Payment status updated');
    } catch (error) {
      next(error);
    }
  };
}
