import { PrismaClient } from '@prisma/client';

export type { Prisma } from '@prisma/client';
export { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient.
 * NestJS will wrap this in a PrismaService; Next.js can import directly.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
