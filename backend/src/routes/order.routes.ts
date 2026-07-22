import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createOrderSchema } from '../dto/order.dto';
import { upload } from '../services/upload/upload.service';

const router = Router();
const controller = new OrderController();

router.use(authenticate);

router.get('/', controller.findAll);
router.post('/:id/proof', upload.single('file'), controller.uploadProof);
router.get('/:id', controller.findById);
router.post('/', validate(createOrderSchema), controller.create);

export default router;
