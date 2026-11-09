import { QUESTIONNAIRE_MAX_STEPS } from "./questionnaire.constants";
import {
  isTextWithinLength,
  maxLengthFor,
  minLengthFor,
  QUESTIONNAIRE_BUDGET_MAX_DIGITS,
} from "./questionnaire.limits";
import type { QuestionnaireForm } from "./questionnaire.types";

type Rule = {
  /** Field marked with the error style when this rule fails; omitted for cross-field rules. */
  field?: keyof QuestionnaireForm;
  isValid: (form: QuestionnaireForm) => boolean;
  message: (form: QuestionnaireForm) => string;
};

/** Fields validated with the shared text bounds get one dynamic message. */
const textRule = (field: TextRuleKey, message: string): Rule => ({
  field,
  isValid: (form) => isTextWithinLength(field, form[field]),
  message: (form) =>
    form[field].trim() === ""
      ? message
      : `Use entre ${minLengthFor(field)} e ${maxLengthFor(field)} caracteres.`,
});

type TextRuleKey =
  | "problem"
  | "affectedUsers"
  | "northQuestion"
  | "hypothesis"
  | "audiencePainPoints"
  | "audienceAssumptions"
  | "notAudience"
  | "requirements"
  | "successCriteria"
  | "valueProposition"
  | "differentiation"
  | "title"
  | "description";

/**
 * Required-field rules grouped by wizard step, so each page can be
 * validated before the user is allowed to advance to the next one.
 * Text fields enforce both the empty state and the advertised
 * min/max length boundaries.
 */
const stepRules: Record<number, Rule[]> = {
  1: [
    textRule("problem", "Descreva o problema a ser resolvido."),
    textRule("affectedUsers", "Descreva quem é mais afetado pelo problema."),
    textRule("northQuestion", "Descreva a questão norte do projeto."),
    textRule("hypothesis", "Descreva a sua hipótese sobre o problema."),
  ],
  2: [
    textRule("audiencePainPoints", "Descreva os objetivos e os pontos de dor dos usuários."),
    textRule("audienceAssumptions", "Descreva as suposições que estamos fazendo sobre eles."),
    textRule("notAudience", "Descreva quem não é o usuário-alvo."),
  ],
  3: [
    textRule("requirements", "Descreva o que o produto deve realizar."),
    textRule("successCriteria", "Descreva como é o sucesso do produto."),
    textRule("valueProposition", "Descreva a proposta de valor central do produto."),
    textRule("differentiation", "Descreva o que diferencia o produto das alternativas."),
    {
      field: "platforms",
      isValid: (form) => form.platforms.length > 0,
      message: () => "Selecione ao menos uma plataforma.",
    },
  ],
  4: [
    textRule("title", "O título do projeto é obrigatório."),
    textRule("description", "A descrição do projeto é obrigatória."),
    {
      field: "category",
      isValid: (form) => isFilled(form.category),
      message: () => "A categoria do projeto é obrigatória.",
    },
    {
      field: "subCategory",
      isValid: (form) => isFilled(form.subCategory),
      message: () => "A sub-categoria do projeto é obrigatória.",
    },
    {
      field: "minBudget",
      isValid: (form) => isBudgetFilled(form.minBudget),
      message: () => "O orçamento mínimo é obrigatório.",
    },
    {
      field: "maxBudget",
      isValid: (form) => isBudgetFilled(form.maxBudget),
      message: () => "O orçamento máximo é obrigatório.",
    },
    {
      field: "deadline",
      isValid: (form) => isFilled(form.deadline),
      message: () => "O prazo final do projeto é obrigatório.",
    },
    {
      // Root-cause check first: an over-long budget also looks inverted.
      isValid: (form) => !exceedsBudgetDigits(form),
      message: () => `Cada orçamento aceita no máximo ${QUESTIONNAIRE_BUDGET_MAX_DIGITS} dígitos.`,
    },
    {
      isValid: (form) => !isBudgetInverted(form),
      message: () => "O orçamento máximo não pode ser menor que o mínimo.",
    },
  ],
};

const isFilled = (value: string): boolean => value.trim().length > 0;

const isBudgetFilled = (value: string): boolean =>
  isFilled(value) && Number(value) > 0;

/** Guards against a stale localStorage draft carrying too many digits. */
export const exceedsBudgetDigits = (form: QuestionnaireForm): boolean =>
  [form.minBudget, form.maxBudget].some(
    (budget) => budget.length > QUESTIONNAIRE_BUDGET_MAX_DIGITS,
  );

export const isBudgetInverted = (form: QuestionnaireForm): boolean =>
  form.minBudget !== "" &&
  form.maxBudget !== "" &&
  Number(form.maxBudget) < Number(form.minBudget);

/** Budget error bound for the red style: empty, zero, inverted or too long. */
export const hasBudgetError = (form: QuestionnaireForm, field: "minBudget" | "maxBudget"): boolean => {
  const value = form[field];

  if (!isBudgetFilled(value) || value.length > QUESTIONNAIRE_BUDGET_MAX_DIGITS) return true;

  return field === "maxBudget" && isBudgetInverted(form);
};

/**
 * Validates the required fields of a single wizard step and returns the
 * message of the first invalid input, or null when the step is complete.
 */
export const validateStep = (form: QuestionnaireForm, step: number): string | null => {
  const rules = stepRules[step] ?? [];
  const failedRule = rules.find((rule) => !rule.isValid(form));

  return failedRule ? failedRule.message(form) : null;
};

/**
 * Returns every required field of the given step that is currently
 * invalid, for marking inputs with the error style.
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
