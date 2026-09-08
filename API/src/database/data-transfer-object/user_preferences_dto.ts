import z from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const UserPreferenceSchema = z.object({
  id: idSchema,
  userId: idSchema,
  emailNotifications: z.boolean().default(true),
  messageNotifications: z.boolean().default(true),
  projectNotifications: z.boolean().default(true),
  reviewNotifications: z.boolean().default(true),
  createdAt: z.union([z.date(), z.string().datetime(), z.string().uuid()]).nullable().optional(),
  updatedAt: z.union([z.date(), z.string().datetime(), z.string().uuid()]).nullable().optional(),
});

const UserPreferenceDTOs = createCrudSchemas(UserPreferenceSchema, [
  "id",
]);

export const UserPreferenceCreateSchema = UserPreferenceDTOs.create;
export const UserPreferenceUpdateSchema = UserPreferenceDTOs.update;

// export type UserPreferenceDTO = z.infer<typeof UserPreferenceDTOs.dto>;
// export type UserPreferenceCreate = z.infer<typeof UserPreferenceDTOs.create>;
// export type UserPreferenceUpdate = z.infer<typeof UserPreferenceDTOs.update>;
