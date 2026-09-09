import { z } from "zod";

export function createCrudSchemas<T extends z.ZodObject<any>, OmitCreate extends keyof T["shape"]>(
  baseSchema: T,
  omitFromCreate: OmitCreate[]
) {
  const mask = Object.fromEntries(
    omitFromCreate.map((key) => [key, true])
  ) as { [K in OmitCreate]: true };

  const createSchema = (baseSchema as any).omit(mask);

  return {
    dto: baseSchema,
    create: createSchema,
    update: createSchema.partial(),
  };
}

export const idSchema = z.string().uuid();

export const timestampsSchema = z.object({
  createdAt: z.union([z.date(), z.string().datetime()]).nullable().optional(),
  updatedAt: z.union([z.date(), z.string().datetime()]).nullable().optional(),
});
