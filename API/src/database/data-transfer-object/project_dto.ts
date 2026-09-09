import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";
import { PlatformTypeEnum, ProgrammingLanguageEnum, ProjectStatusEnum, AudienceEnum } from "./enums";

export const ProjectDTOSchema = z.object({
  id: idSchema,
  clientId: idSchema,
  programmerId: idSchema.nullable().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.string().min(1).max(200),
  sub_category: z.string().min(1).max(200),
  primaryLanguage: ProgrammingLanguageEnum.default("CSHARP"),
  platforms: z.array(PlatformTypeEnum).min(1),
  status: ProjectStatusEnum.default("OPEN"),
  audience: AudienceEnum.default("CLIENTS"),
  minBudget: z.string().min(1),
  maxBudget: z.string().min(1),
  completedAt: z.union([z.date(), z.string().datetime(), z.string()]).nullable().optional(),
}).merge(timestampsSchema);

export const ProjectSchema = ProjectDTOSchema;

const ProjectDTOs = createCrudSchemas(ProjectDTOSchema, [
  "id",
  "clientId",
  "programmerId",
  "completedAt",
  "createdAt",
  "updatedAt",
]);

export const ProjectCreateSchema = ProjectDTOs.create;
export const ProjectUpdateSchema = ProjectDTOs.update;

export type ProjectDTO = z.infer<typeof ProjectDTOSchema>;
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;
