import { describe, expect, test } from "bun:test";
import { initialQuestionnaireForm } from "@/pages/questionnaire/questionnaire.constants";
import {
  maxLengthFor,
  minLengthFor,
  QUESTIONNAIRE_BUDGET_MAX_DIGITS,
  QUESTIONNAIRE_TEXT_MAX,
  QUESTIONNAIRE_TEXT_MIN,
  QUESTIONNAIRE_TITLE_MAX,
  QUESTIONNAIRE_TITLE_MIN,
} from "@/pages/questionnaire/questionnaire.limits";
import {
  exceedsBudgetDigits,
  getUnfilledFields,
  hasBudgetError,
  isBudgetInverted,
  validateQuestionnaire,
  validateStep,
} from "@/pages/questionnaire/questionnaire.validation";
import type { QuestionnaireForm } from "@/pages/questionnaire/questionnaire.types";

const makeForm = (overrides: Partial<QuestionnaireForm> = {}): QuestionnaireForm => ({
  ...initialQuestionnaireForm,
  problem: "Usuarios perdem tempo reformatando documentos manualmente.",
  affectedUsers: "Escritorios de pequeno porte que emitem notas fiscais.",
  northQuestion: "Como podemos automatizar a emissao de notas fiscais?",
  hypothesis: "Um gerador baseado em templates reduz o tempo de emissao.",
  audiencePainPoints: "Perdem horas conferindo dados fiscais manualmente.",
  audienceAssumptions: "Acreditamos que ja usam planilhas no dia a dia.",
  notAudience: "Grandes empresas com sistemas fiscais integrados.",
  requirements: "Importar planilha e emitir a nota fiscal em PDF.",
  successCriteria: "Emissao de uma nota fiscal em menos de um minuto.",
  valueProposition: "Economia de tempo e eliminacao de erros manuais.",
  differentiation: "Templates prontos para pequenos negocios brasileiros.",
  title: "Emissor de notas fiscais automatizado",
  description: "Ferramenta que gera notas fiscais a partir de planilhas.",
  platforms: ["WEB"],
  category: "WEBSITES",
  subCategory: "WORDPRESS",
  minBudget: "1000",
  maxBudget: "5000",
  deadline: "2026-12-31",
  ...overrides,
});

describe("Questionnaire limits", () => {
  test("text fields use the shared bounds; title uses its own", () => {
    expect(minLengthFor("problem")).toBe(QUESTIONNAIRE_TEXT_MIN);
    expect(maxLengthFor("problem")).toBe(QUESTIONNAIRE_TEXT_MAX);
    expect(minLengthFor("title")).toBe(QUESTIONNAIRE_TITLE_MIN);
    expect(maxLengthFor("title")).toBe(QUESTIONNAIRE_TITLE_MAX);
  });
});

describe("validateStep length boundaries", () => {
  test("accepts a field exactly at the minimum length", () => {
    const form = makeForm({ problem: "a".repeat(QUESTIONNAIRE_TEXT_MIN) });

    expect(validateStep(form, 1)).toBeNull();
  });

  test("accepts a field exactly at the maximum length", () => {
    const form = makeForm({ problem: "a".repeat(QUESTIONNAIRE_TEXT_MAX) });

    expect(validateStep(form, 1)).toBeNull();
  });

  test("rejects a field one character below the minimum", () => {
    const form = makeForm({ problem: "a".repeat(QUESTIONNAIRE_TEXT_MIN - 1) });

    expect(validateStep(form, 1)).toContain("30");
  });

  test("rejects a restored draft one character above the maximum", () => {
    const form = makeForm({ problem: "a".repeat(QUESTIONNAIRE_TEXT_MAX + 1) });

    expect(validateStep(form, 1)).toContain("256");
  });

  test("rejects a title below the title minimum", () => {
    const form = makeForm({ title: "a".repeat(QUESTIONNAIRE_TITLE_MIN - 1) });

    expect(validateStep(form, 4)).toContain("10");
  });

  test("empty required text reports the required message", () => {
    const form = makeForm({ problem: "   " });

    expect(validateStep(form, 1)).toBe("Descreva o problema a ser resolvido.");
  });
});

describe("getUnfilledFields marks boundary violations", () => {
  test("too-short and too-long fields are marked invalid", () => {
    const tooShort = makeForm({ hypothesis: "curto" });
    const tooLong = makeForm({ hypothesis: "a".repeat(300) });

    expect(getUnfilledFields(tooShort, 1).has("hypothesis")).toBe(true);
    expect(getUnfilledFields(tooLong, 1).has("hypothesis")).toBe(true);
  });
});

describe("budget validation", () => {
  test("isBudgetInverted flags max below min", () => {
    expect(isBudgetInverted(makeForm({ minBudget: "5000", maxBudget: "1000" }))).toBe(true);
    expect(isBudgetInverted(makeForm({ minBudget: "1000", maxBudget: "5000" }))).toBe(false);
  });

  test("budgets must be positive", () => {
    expect(hasBudgetError(makeForm({ minBudget: "0" }), "minBudget")).toBe(true);
    expect(hasBudgetError(makeForm(), "minBudget")).toBe(false);
  });

  test("inverted budget marks only maxBudget", () => {
    const form = makeForm({ minBudget: "5000", maxBudget: "1000" });

    expect(hasBudgetError(form, "minBudget")).toBe(false);
    expect(hasBudgetError(form, "maxBudget")).toBe(true);
  });

  test("exceedsBudgetDigits catches stale drafts", () => {
    const over = "9".repeat(QUESTIONNAIRE_BUDGET_MAX_DIGITS + 1);
    const form = makeForm({ minBudget: over });

    expect(exceedsBudgetDigits(form)).toBe(true);
    expect(validateStep(form, 4)).toContain("12");
  });
});

describe("validateQuestionnaire", () => {
  test("a fully valid form passes all four steps", () => {
    expect(validateQuestionnaire(makeForm())).toBeNull();
  });

  test("a valid form with every field at the maximum passes", () => {
    const form = makeForm({
      problem: "a".repeat(QUESTIONNAIRE_TEXT_MAX),
      description: "b".repeat(QUESTIONNAIRE_TEXT_MAX),
      title: "t".repeat(QUESTIONNAIRE_TITLE_MAX),
    });

    expect(validateQuestionnaire(form)).toBeNull();
  });
});
