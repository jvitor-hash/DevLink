import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const UserPreferenceSchema = z.object({
  id: idSchema,
  userId: idSchema,
  email_notifications: z.boolean().default(true),
  message_notifications: z.boolean().default(true),
  project_notifications: z.boolean().default(true),
  review_notifications: z.boolean().default(true),
}).merge(timestampsSchema);

const UserPreferenceDTOs = createCrudSchemas(UserPreferenceSchema, [
  "id",
  "userId",
  "createdAt",
  "updatedAt",
]);

export const UserPreferenceCreateSchema = UserPreferenceDTOs.create;
export const UserPreferenceUpdateSchema = UserPreferenceDTOs.update;

export type UserPreferenceDTO = z.infer<typeof UserPreferenceSchema>;
export type UserPreferenceCreate = z.infer<typeof UserPreferenceCreateSchema>;
export type UserPreferenceUpdate = z.infer<typeof UserPreferenceUpdateSchema>;
