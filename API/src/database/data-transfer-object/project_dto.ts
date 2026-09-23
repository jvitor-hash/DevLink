import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";
import { PlatformTypeEnum, ProgrammingLanguageEnum, ProjectStatusEnum, AudienceEnum } from "./enums";

const questionnaireField = z.string().min(1).nullable().optional();

export const ProjectDTOSchema = z.object({
  id: idSchema,
  clientId: idSchema,
  programmerId: idSchema.nullable().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.string().min(1).max(200),
  sub_category: z.string().min(1).max(200),
  problem: questionnaireField,
  user_actions: questionnaireField,
  affectedUsers: questionnaireField,
  northQuestion: questionnaireField,
  hypothesis: questionnaireField,
  audiencePainPoints: questionnaireField,
  audienceAssumptions: questionnaireField,
  notAudience: questionnaireField,
  requirements: questionnaireField,
  successCriteria: questionnaireField,
  valueProposition: questionnaireField,
  differentiation: questionnaireField,
  primaryLanguage: ProgrammingLanguageEnum.default("CSHARP"),
  platforms: z.array(PlatformTypeEnum).min(1),
  status: ProjectStatusEnum.default("OPEN"),
  audience: AudienceEnum.default("CLIENTS"),
  minBudget: z.number().min(1),
  maxBudget: z.number().min(1),
  saveTotalCount: z.number().int().min(0).default(0),
  viewTotalCount: z.number().int().min(0).default(0),
  lastViewedAt: z.union([z.date(), z.string().datetime(), z.string()]).nullable().optional(),
  negotiationStartedAt: z.union([z.date(), z.string().datetime(), z.string()]).nullable().optional(),
  deadline: z.union([z.date(), z.string().datetime(), z.string()]).nullable().optional(),
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
  "saveTotalCount",
  "viewTotalCount",
  "lastViewedAt",
  "negotiationStartedAt",
]);

const budgetRangeRefinement = (data: { minBudget?: number; maxBudget?: number }): boolean =>
  data.minBudget === undefined || data.maxBudget === undefined || data.maxBudget >= data.minBudget;

const budgetRangeMessage = "Orcamento maximo deve ser maior ou igual ao minimo";

export const ProjectCreateSchema = ProjectDTOs.create.refine(budgetRangeRefinement, {
  message: budgetRangeMessage,
  path: ["maxBudget"],
});

export const ProjectUpdateSchema = ProjectDTOs.update.refine(budgetRangeRefinement, {
  message: budgetRangeMessage,
  path: ["maxBudget"],
});

export type ProjectDTO = z.infer<typeof ProjectDTOSchema>;
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;
