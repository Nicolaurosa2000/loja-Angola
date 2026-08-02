import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    const dbUrl = process.env.DATABASE_URL || '';
    const dbType = dbUrl.includes('supabase') ? 'Supabase' : 'Local PostgreSQL';
    console.log(`[DB] Database connected successfully (${dbType})`);
  } catch (error) {
    console.error('[DB] Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('[DB] Database disconnected');
}
