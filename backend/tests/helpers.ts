import { prisma } from '../src/config/database';
import { app } from '../src/app';

export async function setupTestApp() {
  return app;
}

export async function closeTestApp() {
  await prisma.$disconnect();
}
