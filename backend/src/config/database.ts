import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton.
 *
 * Prevents multiple Prisma instances in development (HMR / ts-node-dev
 * respawn). In production, a single instance is reused for the process
 * lifetime.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
