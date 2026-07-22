import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createAddressSchema, updateAddressSchema } from '../dto/address.dto';

const router = Router();
const controller = new AddressController();

router.use(authenticate);

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', validate(createAddressSchema), controller.create);
router.put('/:id', validate(updateAddressSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
