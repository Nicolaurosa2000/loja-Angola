import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { upload } from '../services/upload/upload.service';

const router = Router();
const uploadController = new UploadController();

router.post('/', upload.single('file'), uploadController.upload);
router.delete('/:id', uploadController.delete);

export default router; 