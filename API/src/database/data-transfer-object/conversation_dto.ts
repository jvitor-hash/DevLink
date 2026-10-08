import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const ConversationSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  userId: idSchema,
  recipientId: idSchema,
  lastMessage: z.string().nullable().optional(),
  unreadMessages: z.number().default(0),
}).merge(timestampsSchema);

const ConversationDTOs = createCrudSchemas(ConversationSchema, [
  "id",
  "createdAt",
  "updatedAt",
]);

export const ConversationCreateSchema = ConversationDTOs.create;
export const ConversationUpdateSchema = ConversationDTOs.update;

export type ConversationDTO = z.infer<typeof ConversationSchema>;
export type ConversationCreate = z.infer<typeof ConversationCreateSchema>;
export type ConversationUpdate = z.infer<typeof ConversationUpdateSchema>;
