import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report/report.service';
import { sendSuccess } from '../utils/api-response';

export class AdminReportController {
  private service: ReportService;

  constructor() {
    this.service = new ReportService();
  }

  productSales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query as any;
      const data = await this.service.productSales(startDate, endDate);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };

  customerOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query as any;
      const data = await this.service.customerOrders(startDate, endDate);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };

  dailySales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query as any;
      const data = await this.service.dailySales(startDate, endDate);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };

  paymentMethods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query as any;
      const data = await this.service.paymentMethodBreakdown(startDate, endDate);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };

  stockReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.stockReport();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };
}
