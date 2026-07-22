import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer/customer.service';
import { sendSuccess } from '../utils/api-response';
import { getPaginationMeta, getPaginationParams } from '../utils/pagination';

export class AdminCustomerController {
  private service: CustomerService;

  constructor() {
    this.service = new CustomerService();
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
      const customer = await this.service.findById(req.params.id);
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customer = await this.service.toggleActive(req.params.id);
      sendSuccess(res, customer, 'Customer status updated');
    } catch (error) {
      next(error);
    }
  };
}
