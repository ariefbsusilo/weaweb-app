import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Prevent 'database is locked' errors by enabling WAL mode
prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;').catch(console.error);
prisma.$queryRawUnsafe('PRAGMA busy_timeout = 5000;').catch(console.error);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
