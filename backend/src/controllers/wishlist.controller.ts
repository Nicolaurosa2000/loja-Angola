import { Request, Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlist/wishlist.service';
import { sendSuccess, sendCreated } from '../utils/api-response';

export class WishlistController {
  private service: WishlistService;

  constructor() {
    this.service = new WishlistService();
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const items = await this.service.findAll(userId);
      sendSuccess(res, items);
    } catch (error) {
      next(error);
    }
  };

  add = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const item = await this.service.add(userId, req.body.productId);
      sendCreated(res, item, 'Product added to wishlist');
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      await this.service.remove(userId, req.params.productId);
      sendSuccess(res, null, 'Product removed from wishlist');
    } catch (error) {
      next(error);
    }
  };

  count = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const total = await this.service.count(userId);
      sendSuccess(res, { total });
    } catch (error) {
      next(error);
    }
  };
}
