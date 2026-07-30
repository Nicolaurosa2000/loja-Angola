import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload/upload.service';
import { sendSuccess, sendCreated } from '../utils/api-response';

export class UploadController {
  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Recebe o ficheiro na memória através do middleware de upload (Multer memoryStorage)
      if (!req.file) {
        return next(new Error('Nenhum ficheiro fornecido'));
      }

      // 2. Envia o buffer para o Supabase Storage
      const publicUrl = await uploadService.uploadToSupabase(req.file);

      // 3. Salva o registo no banco com a URL pública gerada pelo Supabase
      const record = await uploadService.saveRecord({
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: publicUrl, // 👈 Guarda a URL permanente do Supabase
      });

      sendCreated(res, record, 'Ficheiro carregado com sucesso no Supabase');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Apaga do Supabase e depois do banco de dados
      await uploadService.deleteFromSupabaseAndDb(req.params.id);
      sendSuccess(res, null, 'Ficheiro eliminado com sucesso');
    } catch (error) {
      next(error);
    }
  };
}