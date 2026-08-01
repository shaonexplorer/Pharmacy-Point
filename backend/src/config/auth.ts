import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`Reset password for ${user.email}, URL: ${url}`);
    },
    resetPasswordTokenExpiresIn: 3600,
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: "auth.session.token",
      attributes: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});