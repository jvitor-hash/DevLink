import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const MessageSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  senderId: idSchema,
  content: z.string().min(1),
  isRead: z.boolean().default(false),
  offerDeadline: z.union([z.date(), z.string().datetime(), z.string()]).nullable().optional(),
  offerStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).nullable().optional(),
}).merge(timestampsSchema);

const MessageDTOs = createCrudSchemas(MessageSchema, [
  "id",
  "senderId",
  "createdAt",
  "updatedAt",
]);

// A negotiation offer is a message with a proposed deadline; sending one
// requires the offer deadline and never persists a client-chosen status.
export const MessageCreateSchema = MessageDTOs.create.extend({
  offerDeadline: z.union([z.date(), z.string().datetime(), z.string()]).nullable().optional(),
}).omit({ offerStatus: true });

export const MessageUpdateSchema = MessageDTOs.update
  .extend({
    offerStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).nullable().optional(),
  })
  .omit({ offerDeadline: true });

export type MessageDTO = z.infer<typeof MessageSchema>;
export type MessageCreate = z.infer<typeof MessageCreateSchema>;
export type MessageUpdate = z.infer<typeof MessageUpdateSchema>;
