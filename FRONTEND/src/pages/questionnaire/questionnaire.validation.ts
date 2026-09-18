import { QUESTIONNAIRE_MAX_STEPS } from "./questionnaire.constants";
import type { QuestionnaireForm } from "./questionnaire.types";

type Rule = {
  /** Field marked with the error style when this rule fails; omitted for cross-field rules. */
  field?: keyof QuestionnaireForm;
  isValid: (form: QuestionnaireForm) => boolean;
  message: string;
};

const isFilled = (value: string): boolean => value.trim().length > 0;

/**
 * Required-field rules grouped by wizard step, so each page can be
 * validated before the user is allowed to advance to the next one.
 */
const stepRules: Record<number, Rule[]> = {
  1: [
    {
      field: "problem",
      isValid: (form) => isFilled(form.problem),
      message: "Descreva o problema a ser resolvido.",
    },
    {
      field: "affectedUsers",
      isValid: (form) => isFilled(form.affectedUsers),
      message: "Descreva quem é mais afetado pelo problema.",
    },
    {
      field: "northQuestion",
      isValid: (form) => isFilled(form.northQuestion),
      message: "Descreva a questão norte do projeto.",
    },
    {
      field: "hypothesis",
      isValid: (form) => isFilled(form.hypothesis),
      message: "Descreva a sua hipótese sobre o problema.",
    },
  ],
  2: [
    {
      field: "audiencePainPoints",
      isValid: (form) => isFilled(form.audiencePainPoints),
      message: "Descreva os objetivos e os pontos de dor dos usuários.",
    },
    {
      field: "audienceAssumptions",
      isValid: (form) => isFilled(form.audienceAssumptions),
      message: "Descreva as suposições que estamos fazendo sobre eles.",
    },
    {
      field: "notAudience",
      isValid: (form) => isFilled(form.notAudience),
      message: "Descreva quem não é o usuário-alvo.",
    },
  ],
  3: [
    {
      field: "requirements",
      isValid: (form) => isFilled(form.requirements),
      message: "Descreva o que o produto deve realizar.",
    },
    {
      field: "successCriteria",
      isValid: (form) => isFilled(form.successCriteria),
      message: "Descreva como é o sucesso do produto.",
    },
    {
      field: "valueProposition",
      isValid: (form) => isFilled(form.valueProposition),
      message: "Descreva a proposta de valor central do produto.",
    },
    {
      field: "differentiation",
      isValid: (form) => isFilled(form.differentiation),
      message: "Descreva o que diferencia o produto das alternativas.",
    },
    {
      field: "platforms",
      isValid: (form) => form.platforms.length > 0,
      message: "Selecione ao menos uma plataforma.",
    },
  ],
  4: [
    {
      field: "title",
      isValid: (form) => isFilled(form.title),
      message: "O título do projeto é obrigatório.",
    },
    {
      field: "description",
      isValid: (form) => isFilled(form.description),
      message: "A descrição do projeto é obrigatória.",
    },
    {
      field: "category",
      isValid: (form) => isFilled(form.category),
      message: "A categoria do projeto é obrigatória.",
    },
    {
      field: "subCategory",
      isValid: (form) => isFilled(form.subCategory),
      message: "A sub-categoria do projeto é obrigatória.",
    },
    {
      field: "minBudget",
      isValid: (form) => isFilled(form.minBudget),
      message: "O orçamento mínimo é obrigatório.",
    },
    {
      field: "maxBudget",
      isValid: (form) => isFilled(form.maxBudget),
      message: "O orçamento máximo é obrigatório.",
    },
    {
      field: "deadline",
      isValid: (form) => isFilled(form.deadline),
      message: "O prazo final do projeto é obrigatório.",
    },
    {
      isValid: (form) => !isBudgetInverted(form),
      message: "O orçamento máximo não pode ser menor que o mínimo.",
    },
  ],
};

export const isBudgetInverted = (form: QuestionnaireForm): boolean =>
  form.minBudget !== "" &&
  form.maxBudget !== "" &&
  Number(form.maxBudget) < Number(form.minBudget);

/**
 * Validates the required fields of a single wizard step and returns the
 * message of the first unfilled input, or null when the step is complete.
 */
export const validateStep = (form: QuestionnaireForm, step: number): string | null => {
  const rules = stepRules[step] ?? [];
  const failedRule = rules.find((rule) => !rule.isValid(form));

  return failedRule?.message ?? null;
};

/**
 * Returns every required field of the given step that is currently
 * unfilled/unset, for marking inputs with the error style.
 */
export const getUnfilledFields = (
  form: QuestionnaireForm,
  step: number,
): Set<keyof QuestionnaireForm> => {
  const rules = stepRules[step] ?? [];

  return new Set(
    rules
      .filter((rule) => rule.field !== undefined && !rule.isValid(form))
      .map((rule) => rule.field as keyof QuestionnaireForm),
  );
};

/** Validates every step in order; returns the first error found, if any. */
export const validateQuestionnaire = (form: QuestionnaireForm): string | null => {
  for (let step = 1; step <= QUESTIONNAIRE_MAX_STEPS; step++) {
    const stepError = validateStep(form, step);
    if (stepError) return stepError;
  }

  return null;
};
