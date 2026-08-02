import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
// 1. Ajuste o caminho conforme a localização real do seu ficheiro do Prisma Client
// Se estiver em src/lib/prisma.ts use '../lib/prisma' ou '../../lib/prisma'
import { prisma } from '../../config/database'; 

// Configura o Multer para armazenar na memória
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

// Inicialização do Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

class UploadService {
  private bucketName = 'products'; // Nome do bucket no Supabase

  async uploadToSupabase(file: Express.Multer.File): Promise<string> {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Upload do Buffer para o Supabase Storage
    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Erro no Supabase Storage: ${error.message}`);
    }

    // Retorna a URL pública do ficheiro
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async saveRecord(data: { filename: string; mimeType: string; size: number; url: string }) {
    // 2. Usar prisma.upload em vez de prisma.media para bater com o schema.prisma
    return await prisma.upload.create({
      data: {
        filename: data.filename,
        originalName: data.filename,
        mimeType: data.mimeType,
        size: data.size,
        path: data.url,
        url: data.url,
      },
    });
  }

  async deleteFromSupabaseAndDb(id: string) {
    // 3. Usar prisma.upload para procurar e apagar
    const record = await prisma.upload.findUnique({ where: { id } });
    if (!record) throw new Error('Ficheiro não encontrado');

    const urlParts = record.url.split(`${this.bucketName}/`);
    if (urlParts.length > 1) {
      await supabase.storage.from(this.bucketName).remove([urlParts[1]]);
    }

    return await prisma.upload.delete({ where: { id } });
  }
}

export const uploadService = new UploadService();