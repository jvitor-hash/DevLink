import { z } from "zod";
import { ProgrammingLanguageEnum, PlatformTypeEnum } from "./enums";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

const languagePreference = z.union([z.literal("ALL"), ProgrammingLanguageEnum]);
const platformPreference = z.union([z.literal("ALL"), PlatformTypeEnum]);

export const UserPreferenceSchema = z.object({
  id: idSchema,
  userId: idSchema,
  email_notifications: z.boolean().default(true),
  message_notifications: z.boolean().default(true),
  project_notifications: z.boolean().default(true),
  review_notifications: z.boolean().default(true),
  language: languagePreference.default("ALL"),
  platform: platformPreference.default("ALL"),
  maxDeadlineDays: z.string().regex(/^\d+$/, "Deadline deve ser um numero de dias").default("365"),
  minBudget: z.number().min(0).default(0),
  maxBudget: z.number().min(0).default(0),
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
