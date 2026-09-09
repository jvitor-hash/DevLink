import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { openAPI, admin } from 'better-auth/plugins';
import { db } from "@/client";
import { env } from "@/env";
import { schemas } from "./database/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schemas
  }),

  rateLimit: {
    enabled: true,
    window: 10,
    max: 100
  },

  advanced: {
    database: {
      generateId: "uuid",
    },

    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
      trustedProxies: ['127.0.0.1', '::1', '0.0.0.0']
    }
  },

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    resetPassword: {
      enabled: true,
    },

    password: {
      hash: async (password) => {
        return await Bun.password.hash(password, {
          algorithm: "argon2id",
          memoryCost: 65536, // 64 MiB
          timeCost: 3
        });
      },

      verify: async ({ password, hash }) => {
        return await Bun.password.verify(password, hash);
      }
    }
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 Days
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5 // 5 Minutes
    },
  },

  trustedOrigins: [
    `http://localhost:${env.PORT}`,
    "http://localhost:5173"
  ],

  plugins: [
    openAPI(),
    admin(),
  ]
});
