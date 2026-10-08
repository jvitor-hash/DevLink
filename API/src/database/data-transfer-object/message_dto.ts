import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const MessageSchema = z.object({
  id: idSchema,
  conversationId: idSchema,
  userId: idSchema.optional(),
  content: z.string().min(1),
  isRead: z.boolean().default(false),
  recipientId: idSchema.optional(),
  projectId: idSchema.optional(),
}).merge(timestampsSchema);

const MessageDTOs = createCrudSchemas(MessageSchema, [
  "id",
  "createdAt",
  "updatedAt",
]);

export const MessageCreateSchema = MessageDTOs.create;
export const MessageUpdateSchema = MessageDTOs.update;

export type MessageDTO = z.infer<typeof MessageSchema>;
export type MessageCreate = z.infer<typeof MessageCreateSchema>;
export type MessageUpdate = z.infer<typeof MessageUpdateSchema>;
