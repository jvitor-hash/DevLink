import { z } from 'zod';

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  DATABASE_URL: z.string().refine((val) => val.startsWith("postgres://") || val.startsWith("postgresql://"), {
    message: "DATABASE_URL must start with postgres:// or postgresql://",
  }),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(Bun.env);
