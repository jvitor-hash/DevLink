import { cache, CACHE_KEYS } from "@/lib/utils/session_cache";
import { initialQuestionnaireForm, platformValues, audienceValues, primaryLanguageValues } from "./questionnaire.constants";
import type { Audience, PlatformType, ProgrammingLanguage } from "@/lib/types/database";
import type { QuestionnaireForm } from "./questionnaire.types";

const DRAFT_VERSION = 1;

type StoredDraft = {
  version: number;
  form: QuestionnaireForm;
};

/**
 * Guards against a stale or tampered localStorage entry: the draft is only
 * restored when its shape matches the current form and every enum-like
 * value is one the option tables actually offer.
 */
const sanitizeDraft = (candidate: unknown): QuestionnaireForm | null => {
  if (typeof candidate !== "object" || candidate === null) return null;

  const { version, form } = candidate as Partial<StoredDraft>;
  if (version !== DRAFT_VERSION || typeof form !== "object" || form === null) return null;

  const candidateForm = form as Partial<QuestionnaireForm>;
  const restored: QuestionnaireForm = { ...initialQuestionnaireForm };

  for (const key of Object.keys(initialQuestionnaireForm) as (keyof QuestionnaireForm)[]) {
    const value = candidateForm[key];

    if (key === "platforms") {
      if (Array.isArray(value)) {
        restored.platforms = value.filter(
          (platform): platform is PlatformType =>
            typeof platform === "string" && (platformValues as readonly string[]).includes(platform),
        );
      }
    } else if (key === "audience") {
      if (typeof value === "string" && (audienceValues as readonly string[]).includes(value)) {
        restored.audience = value as Audience;
      }
    } else if (key === "primaryLanguage") {
      if (typeof value === "string" && (primaryLanguageValues as readonly string[]).includes(value)) {
        restored.primaryLanguage = value as ProgrammingLanguage;
      }
    } else if (typeof value === "string") {
      restored[key] = value;
    }
  }

  return restored;
};

/** Restores the persisted draft, or null when none is stored/valid. */
export const loadDraft = (): QuestionnaireForm | null => {
  const stored = cache.get<unknown>(CACHE_KEYS.QUESTIONNAIRE_DRAFT);

  return sanitizeDraft(stored);
};

/** Replaces the persisted draft with the current form state. */
export const saveDraft = (form: QuestionnaireForm): void => {
  cache.set(CACHE_KEYS.QUESTIONNAIRE_DRAFT, { version: DRAFT_VERSION, form } satisfies StoredDraft);
};

/** Removes the persisted draft; called after a successful submission. */
export const clearDraft = (): void => {
  cache.delete(CACHE_KEYS.QUESTIONNAIRE_DRAFT);
};
