import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const MessageSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  senderId: idSchema,
  content: z.string().min(1),
  isRead: z.boolean().default(false),
}).merge(timestampsSchema);

const MessageDTOs = createCrudSchemas(MessageSchema, [
  "id",
  "senderId",
  "createdAt",
  "updatedAt",
]);

export const MessageCreateSchema = MessageDTOs.create;
export const MessageUpdateSchema = MessageDTOs.update;

export type MessageDTO = z.infer<typeof MessageSchema>;
export type MessageCreate = z.infer<typeof MessageCreateSchema>;
export type MessageUpdate = z.infer<typeof MessageUpdateSchema>;
