import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";
import { PlatformTypeEnum, ProgrammingLanguageEnum, ProjectStatusEnum } from "./enums";

// Base schemas
export const ProjectDTOSchema = z.object({
  id: idSchema,
  clientId: idSchema,
  programmerId: idSchema.nullable().optional(),
  title: z.string().max(200),
  description: z.string(),
  category: z.string().max(200),
  sub_category: z.string().max(200),
  primaryLanguage: ProgrammingLanguageEnum.default("CSHARP"),
  platforms: z.array(PlatformTypeEnum),
  status: ProjectStatusEnum.default("OPEN"),
  completedAt: z.string().date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
}).merge(timestampsSchema);

const ProjectDTOs = createCrudSchemas(ProjectDTOSchema, [
  "id",
  "programmerId",
  "completedAt"
]);

export const ProjectCreateSchema = ProjectDTOs.create;
export const ProjectUpdateSchema = ProjectDTOs.update;

// export type ProjectDTO = z.infer<typeof ProjectDTOs.dto>;
// export type ProjectCreate = z.infer<typeof ProjectDTOs.create>;
// export type ProjectUpdate = z.infer<typeof ProjectDTOs.update>;
