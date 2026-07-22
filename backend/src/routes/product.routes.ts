import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createProductSchema, updateProductSchema } from '../dto/product.dto';

const router = Router();
const controller = new ProductController();

router.get('/', controller.findAll);
router.get('/featured', controller.getFeatured);
router.get('/best-sellers', controller.getBestSellers);
router.get('/category/:categoryId', controller.findByCategory);
router.get('/:slug', controller.findBySlug);

router.post('/', authenticate, authorize('ADMIN', 'STAFF'), validate(createProductSchema), controller.create);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), validate(updateProductSchema), controller.update);
router.delete('/:id', authenticate, authorize('ADMIN'), controller.delete);

export default router;
