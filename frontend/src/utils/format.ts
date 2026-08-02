// Define a URL base do seu servidor no Render (pode usar variável de ambiente se preferir)
const BACKEND_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
  : 'https://loja-angola-tj2g.onrender.com';

export function formatCurrency(value: number): string {
  if (isNaN(value)) return '0 Kz';
  return `${value.toLocaleString('pt-AO')} Kz`;
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  return new Date(date).toLocaleString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `+244 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getImageUrl(path?: string | null): string {
  // Trata caminhos vazios, nulos ou indefinidos
  if (!path || path.trim() === '') {
    return '/placeholder.png'; 
  }

  // Se já for uma URL externa completa (Ex: Cloudinary, S3, Unsplash)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Garante a formatação do caminho relativo apontando para a pasta /uploads
  const cleanPath = path.startsWith('/uploads/')
    ? path
    : path.startsWith('/')
    ? `/uploads${path}`
    : `/uploads/${path}`;

  return `${BACKEND_BASE_URL}${cleanPath}`;
}