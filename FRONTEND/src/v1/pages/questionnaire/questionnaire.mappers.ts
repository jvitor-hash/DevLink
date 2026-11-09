import type { ProjectCreate } from "@/data/types/database";
import type { QuestionnaireForm } from "./questionnaire.types";

const toNullableText = (value: string): string | null => (value.trim() ? value : null);

const toBudget = (minBudget: string, maxBudget: string): number => {
  if (maxBudget !== "") return Number(maxBudget);
  if (minBudget !== "") return Number(minBudget);

  return 1;
};

export const toProjectCreatePayload = (form: QuestionnaireForm): ProjectCreate => ({
  title: form.title,
  description: form.description,
  category: form.category,
  sub_category: form.subCategory,
  primaryLanguage: form.primaryLanguage,
  platforms: form.platforms,
  audience: form.audience,
  minBudget: form.minBudget === "" ? 1 : Number(form.minBudget),
  maxBudget: toBudget(form.minBudget, form.maxBudget),
  deadline: form.deadline === "" ? null : new Date(form.deadline).toISOString(),
  problem: toNullableText(form.problem),
  affectedUsers: toNullableText(form.affectedUsers),
  northQuestion: toNullableText(form.northQuestion),
  hypothesis: toNullableText(form.hypothesis),
  audiencePainPoints: toNullableText(form.audiencePainPoints),
  audienceAssumptions: toNullableText(form.audienceAssumptions),
  notAudience: toNullableText(form.notAudience),
  requirements: toNullableText(form.requirements),
  successCriteria: toNullableText(form.successCriteria),
  valueProposition: toNullableText(form.valueProposition),
  differentiation: toNullableText(form.differentiation),
});
