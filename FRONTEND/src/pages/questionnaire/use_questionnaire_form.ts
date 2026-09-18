import { useCallback, useEffect, useState } from "react";
import type { PlatformType } from "@/lib/types/database";
import { initialQuestionnaireForm } from "./questionnaire.constants";
import { loadDraft, saveDraft, clearDraft } from "./questionnaire.draft";
import { isBudgetInverted } from "./questionnaire.validation";
import type { QuestionnaireForm, QuestionnaireFieldSetter } from "./questionnaire.types";

/**
 * Owns the questionnaire form state: single-field updates, platform
 * toggling and reset. The draft persists to localStorage on every change
 * and is restored on mount, so a refresh never loses progress.
 * Validation and submission stay outside.
 */
export function useQuestionnaireForm() {
  // Restore the persisted draft lazily on mount (refresh-safe), falling
  // back to a pristine form when nothing valid is stored.
  const [form, setForm] = useState<QuestionnaireForm>(() => loadDraft() ?? initialQuestionnaireForm);

  // Persist on every change so an unexpected quit keeps the latest state.
  // The pristine form is never persisted: after resetForm clears the
  // draft, this effect would otherwise immediately re-write it.
  useEffect(() => {
    if (form !== initialQuestionnaireForm) saveDraft(form);
  }, [form]);

  const setField = useCallback<QuestionnaireFieldSetter>((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const togglePlatform = useCallback((platform: PlatformType, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      platforms: checked
        ? [...prev.platforms, platform]
        : prev.platforms.filter((p) => p !== platform),
    }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(initialQuestionnaireForm);
    clearDraft();
  }, []);

  return {
    form,
    setField,
    togglePlatform,
    resetForm,
    isBudgetInverted: isBudgetInverted(form),
  };
}
