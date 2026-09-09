import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const SavedTicketSchema = z.object({
  id: idSchema,
  userId: idSchema,
  projectId: idSchema,
  createdAt: z.union([z.date(), z.string().datetime()]).nullable().optional(),
});

const SavedTicketDTOs = createCrudSchemas(SavedTicketSchema, [
  "id",
  "userId",
  "createdAt",
]);

export const SavedTicketCreateSchema = SavedTicketDTOs.create;
export const SavedTicketUpdateSchema = SavedTicketDTOs.update;
export const SavedTickerUpdateSchema = SavedTicketDTOs.update; // backward compatibility

export type SavedTicketDTO = z.infer<typeof SavedTicketSchema>;
export type SavedTicketCreate = z.infer<typeof SavedTicketCreateSchema>;
export type SavedTicketUpdate = z.infer<typeof SavedTicketUpdateSchema>;
