import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const TodoSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  creatorId: idSchema,
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  isDone: z.boolean().default(false),
}).merge(timestampsSchema);

const TodoDTOs = createCrudSchemas(TodoSchema, [
  "id",
  "creatorId",
  "createdAt",
  "updatedAt",
]);

export const TodoCreateSchema = TodoDTOs.create;
export const TodoUpdateSchema = TodoDTOs.update;

export type TodoDTO = z.infer<typeof TodoSchema>;
export type TodoCreate = z.infer<typeof TodoCreateSchema>;
export type TodoUpdate = z.infer<typeof TodoUpdateSchema>;
