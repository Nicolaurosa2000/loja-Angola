import { Request, Response, NextFunction } from "express";
import { FinanceService } from "../services/finance/finance.service";
import { sendSuccess } from "../utils/api-response";

export class AdminFinanceController {
  private service: FinanceService;

  constructor() {
    this.service = new FinanceService();
  }

  overview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const period = (req.query.period as string) || "30d";
      const data = await this.service.getOverview(period);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };

  transactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await this.service.getTransactions(limit);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };
}
