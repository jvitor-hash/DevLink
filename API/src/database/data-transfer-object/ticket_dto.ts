import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";
import { TicketStatusEnum } from "./enums";

export const TicketSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  creatorId: idSchema,
  assigneeId: idSchema.nullable().optional(),
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  status: TicketStatusEnum.default("BACKLOG"),
  position: z.number().int().min(0).default(0),
}).merge(timestampsSchema);

const TicketDTOs = createCrudSchemas(TicketSchema, [
  "id",
  "creatorId",
  "createdAt",
  "updatedAt",
]);

export const TicketCreateSchema = TicketDTOs.create;
export const TicketUpdateSchema = TicketDTOs.update;

export type TicketDTO = z.infer<typeof TicketSchema>;
export type TicketCreate = z.infer<typeof TicketCreateSchema>;
export type TicketUpdate = z.infer<typeof TicketUpdateSchema>;
