import z from "zod";
import { createCrudSchemas, idSchema } from "./helper";

export const SavedTicketSchema = z.object({
  id: idSchema,
  userId: idSchema,
  projectId: idSchema,
  createdAt: z.union([z.date(), z.string().datetime(), z.string().uuid()]).nullable().optional(),
});

const SavedTicketDTOs = createCrudSchemas(SavedTicketSchema, [
  "id",
  "createdAt"
]);

export const SavedTicketCreateSchema = SavedTicketDTOs.create;
export const SavedTickerUpdateSchema = SavedTicketDTOs.update;

// export type SavedTicketDTO = z.infer<typeof SavedTicketDTOs.dto>;
// export type SavedTicketCreate = z.infer<typeof SavedTicketDTOs.create>;
// export type SavedTickerUpdate = z.infer<typeof SavedTicketDTOs.update>;
