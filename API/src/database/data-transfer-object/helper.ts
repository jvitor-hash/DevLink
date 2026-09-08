import z from "zod";

export function createCrudSchemas<T extends z.ZodObject<any>, OmitCreate extends keyof T["shape"]>(baseSchema: T, omitFromCreate: OmitCreate[]) {
  const createSchema = baseSchema.omit(
    Object.fromEntries(
      omitFromCreate.map((key) => [key, true])
    ) as Record<OmitCreate, true>
  );

  return {
    dto: baseSchema,
    create: createSchema,
    update: createSchema.partial(),
  };
}

export const idSchema = z.string().uuid();

export const timestampsSchema = z.object({
  createdAt: z.union([z.date(), z.string().datetime(), z.string().uuid()]).nullable().optional(),
  updatedAt: z.union([z.date(), z.string().datetime(), z.string().uuid()]).nullable().optional(),
});
