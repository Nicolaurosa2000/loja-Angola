import { Request, Response, NextFunction } from 'express';
import { uploadService, upload } from '../services/upload/upload.service';
import { sendSuccess, sendCreated } from '../utils/api-response';

export class UploadController {
  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      upload.single('file')(req, res, async (err) => {
        if (err) return next(err);
        if (!req.file) return next(new Error('No file provided'));

        if (req.file.mimetype.startsWith('image/')) {
          await uploadService.processImage(req.file.path, req.file.filename);
        }

        const record = await uploadService.saveRecord(req.file);
        sendCreated(res, record, 'File uploaded');
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await uploadService.deleteRecord(req.params.id);
      sendSuccess(res, null, 'File deleted');
    } catch (error) {
      next(error);
    }
  };
}
