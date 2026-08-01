import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

// Prevent multiple Prisma instances in development (HMR)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    async sendResetPassword({ user, url }) {
      // Replace with your email provider (e.g., Resend, Nodemailer, Postmark)
      console.log(`Reset password for ${user.email}, URL: ${url}`);
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour in seconds
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  secret: process.env.BETTER_AUTH_SECRET || 'fallback-secret-key-for-development-only',
});
