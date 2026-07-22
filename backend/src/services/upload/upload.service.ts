import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../../config/app';
import { prisma } from '../../config/database';
import { AppError } from '../../middlewares';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, appConfig.upload.dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${uuidv4()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'video/webm',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: appConfig.upload.maxFileSize },
});

export class UploadService {
  async processImage(filePath: string, filename: string): Promise<void> {
    const ext = path.extname(filename).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      const outputPath = filePath.replace(ext, '_optimized.webp');
      await sharp(filePath)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
    }
  }

  async saveRecord(file: Express.Multer.File): Promise<{
    id: string;
    url: string;
    filename: string;
  }> {
    const record = await prisma.upload.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${file.filename}`,
      },
    });

    return {
      id: record.id,
      url: record.url,
      filename: record.filename,
    };
  }

  async deleteRecord(id: string): Promise<void> {
    await prisma.upload.delete({ where: { id } });
  }
}

export const uploadService = new UploadService();
