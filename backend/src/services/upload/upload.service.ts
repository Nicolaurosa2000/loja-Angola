import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../../config/prisma'; // Adapte o caminho do seu Prisma Client

// Configura o Multer para armazenar na memória em vez do disco
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

// Inicialização do Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

class UploadService {
  private bucketName = 'products'; // Nome do bucket que criou no Supabase

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
    // Salva a referência na sua base de dados
    return await prisma.media.create({
      data: {
        filename: data.filename,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
      },
    });
  }

  async deleteFromSupabaseAndDb(id: string) {
    const record = await prisma.media.findUnique({ where: { id } });
    if (!record) throw new Error('Ficheiro não encontrado');

    const urlParts = record.url.split(`${this.bucketName}/`);
    if (urlParts.length > 1) {
      await supabase.storage.from(this.bucketName).remove([urlParts[1]]);
    }

    return await prisma.media.delete({ where: { id } });
  }
}

export const uploadService = new UploadService();