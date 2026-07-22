import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createBrandSchema, updateBrandSchema } from '../dto/brand.dto';

const router = Router();
const controller = new BrandController();

router.get('/', controller.findAll);
router.get('/paginate', controller.paginate);
router.get('/:id', controller.findById);

router.post('/', authenticate, authorize('ADMIN', 'STAFF'), validate(createBrandSchema), controller.create);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), validate(updateBrandSchema), controller.update);
router.delete('/:id', authenticate, authorize('ADMIN'), controller.delete);

export default router;
