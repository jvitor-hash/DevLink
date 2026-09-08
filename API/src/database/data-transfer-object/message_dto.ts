import z from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const MessageSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  senderId: idSchema,
  content: z.string().min(1),
  isRead: z.boolean().default(false),
  createdAt: z.union([z.date(), z.string().datetime(), z.string().uuid()]).nullable().optional(),
  updatedAt: z.union([z.date(), z.string().datetime(), z.string().uuid()]).nullable().optional(),
});

const MessageDTOs = createCrudSchemas(MessageSchema, [
  "id",
  "createdAt",
  "updatedAt"
]);

export const MessageCreateSchema = MessageDTOs.create;
export const MessageUpdateSchema = MessageDTOs.update;

// export type MessageDTO = z.infer<typeof MessageDTOs.dto>;
// export type MessageCreate = z.infer<typeof MessageDTOs.create>;
// export type MessageUpdate = z.infer<typeof MessageDTOs.update>;
