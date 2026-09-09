import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const UserPreferenceSchema = z.object({
  id: idSchema,
  userId: idSchema,
  emailNotifications: z.boolean().default(true),
  messageNotifications: z.boolean().default(true),
  projectNotifications: z.boolean().default(true),
  reviewNotifications: z.boolean().default(true),
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
