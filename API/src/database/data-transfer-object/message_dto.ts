import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";
import { z } from "zod";

export const MessageSchema = z.object({
  id: idSchema,
  conversationId: idSchema,
  userId: idSchema.optional(),
  content: z.string().min(1),
  isRead: z.boolean().default(false),
  readAt: z.union([z.date(), z.string().datetime()]).nullable().optional(),
  recipientId: idSchema.optional(),
  projectId: idSchema.optional(),
  messageType: z.enum(["MESSAGE", "OFFER"]).default("MESSAGE"),
  offerStatus: z.enum(["PENDING", "REFUSED", "ACCEPTED"]).nullable().optional(),
  offerMoney: z.union([z.number().nonnegative(), z.string()]).nullable().optional(),
  offerDeadline: z.union([z.date(), z.string().datetime()]).nullable().optional(),
}).merge(timestampsSchema);

const MessageDTOs = createCrudSchemas(MessageSchema, [
  "id",
  "createdAt",
  "updatedAt",
  "readAt",
]);

export const MessageCreateSchema = MessageDTOs.create;
export const MessageUpdateSchema = MessageDTOs.update;

export type MessageDTO = z.infer<typeof MessageSchema>;
export type MessageCreate = z.infer<typeof MessageCreateSchema>;
export type MessageUpdate = z.infer<typeof MessageUpdateSchema>;
