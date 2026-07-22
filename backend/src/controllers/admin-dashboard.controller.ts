import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard/dashboard.service';
import { sendSuccess } from '../utils/api-response';

export class AdminDashboardController {
  private service: DashboardService;

  constructor() {
    this.service = new DashboardService();
  }

  getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as string) || '30d';
      const data = await this.service.getOverview(period);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };

  recentOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const orders = await this.service.recentOrders(limit);
      sendSuccess(res, orders);
    } catch (error) {
      next(error);
    }
  };

  topProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const products = await this.service.topProducts(limit);
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  };

  salesByPeriod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query as any;
      if (!startDate || !endDate) {
        sendSuccess(res, []);
        return;
      }
      const data = await this.service.salesByPeriod(startDate, endDate);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };
}
