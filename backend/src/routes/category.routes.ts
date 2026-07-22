import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createCategorySchema, updateCategorySchema } from '../dto/category.dto';

const router = Router();
const controller = new CategoryController();

router.get('/', controller.findAll);
router.get('/paginate', controller.paginate);
router.get('/:slug', controller.findBySlug);

router.post('/', authenticate, authorize('ADMIN', 'STAFF'), validate(createCategorySchema), controller.create);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), validate(updateCategorySchema), controller.update);
router.delete('/:id', authenticate, authorize('ADMIN'), controller.delete);

export default router;
