import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart/cart.service';
import { sendSuccess } from '../utils/api-response';

export class CartController {
  private service: CartService;

  constructor() {
    this.service = new CartService();
  }

  getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.sub;
      const sessionId = req.query.sessionId as string;
      const cart = await this.service.getCart(userId, sessionId);
      sendSuccess(res, cart);
    } catch (error) {
      next(error);
    }
  };

  addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { productId, quantity } = req.body;
      const cart = await this.service.addItem(userId, productId, quantity);
      sendSuccess(res, cart, 'Item added to cart');
    } catch (error) {
      next(error);
    }
  };

  updateItemQuantity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const cart = await this.service.updateItemQuantity(userId, req.params.itemId, req.body.quantity);
      sendSuccess(res, cart, 'Cart updated');
    } catch (error) {
      next(error);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const cart = await this.service.removeItem(userId, req.params.itemId);
      sendSuccess(res, cart, 'Item removed from cart');
    } catch (error) {
      next(error);
    }
  };

  applyCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const cart = await this.service.applyCoupon(userId, req.body.code);
      sendSuccess(res, cart, 'Coupon applied');
    } catch (error) {
      next(error);
    }
  };

  removeCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const cart = await this.service.removeCoupon(userId);
      sendSuccess(res, cart, 'Coupon removed');
    } catch (error) {
      next(error);
    }
  };
}
