import { coerce, z } from 'zod';

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().startsWith("http://localhost:"),
  DATABASE_URL: z.url().startsWith("postgres://"),
  PORT: z.coerce.number().gte(3000),
})

export const env = envSchema.parse(Bun.env);
