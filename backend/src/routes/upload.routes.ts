import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { UploadController } from '../controllers/upload.controller';

const router = Router();
const uploadCtrl = new UploadController();

router.post('/', authenticate, authorize('ADMIN', 'STAFF'), uploadCtrl.upload);
router.delete('/:id', authenticate, authorize('ADMIN', 'STAFF'), uploadCtrl.delete);

export default router;
