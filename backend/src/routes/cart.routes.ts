import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { addCartItemSchema, updateCartItemSchema, applyCouponSchema } from '../dto/cart.dto';

const router = Router();
const controller = new CartController();

router.use(authenticate);

router.get('/', controller.getCart);
router.post('/items', validate(addCartItemSchema), controller.addItem);
router.patch('/items/:itemId', validate(updateCartItemSchema), controller.updateItemQuantity);
router.delete('/items/:itemId', controller.removeItem);
router.post('/coupon', validate(applyCouponSchema), controller.applyCoupon);
router.delete('/coupon', controller.removeCoupon);

export default router;
