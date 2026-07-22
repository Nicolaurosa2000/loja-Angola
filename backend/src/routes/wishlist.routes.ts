import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { addWishlistItemSchema } from '../dto/wishlist.dto';

const router = Router();
const controller = new WishlistController();

router.use(authenticate);

router.get('/', controller.findAll);
router.get('/count', controller.count);
router.post('/', validate(addWishlistItemSchema), controller.add);
router.delete('/:productId', controller.remove);

export default router;
