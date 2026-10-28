import { useState } from "react";
import { projectService } from "@/data/services/project_service";
import { QUESTIONNAIRE_MAX_STEPS } from "./questionnaire.constants";
import { toProjectCreatePayload } from "./questionnaire.mappers";
import { validateQuestionnaire, validateStep } from "./questionnaire.validation";
import { QuestionnaireProgress } from "./questionnaire_progress";
import { QuestionnaireNavigation } from "./questionnaire_navigation";
import { useQuestionnaireForm } from "./use_questionnaire_form";
import { useProjectCreatePermission } from "./use_project_create_permission";
import { ProblemStep } from "./steps/problem_step";
import { AudienceStep } from "./steps/audience_step";
import { SolutionStep } from "./steps/solution_step";
import { DetailsStep } from "./steps/details_step";

/**
 * Questionnaire wizard orchestrator. Owns only the current step and
 * submission flow; field state lives in useQuestionnaireForm, the
 * permission gate in useProjectCreatePermission, and each page renders
 * through its own step component. Submission feedback is shown through
 * an auto-fading banner.
 */
export default function Questionnaire() {
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  /** Once true, the current step's unfilled required inputs render with the error style. */
  const [showFieldErrors, setShowFieldErrors] = useState<boolean>(false);

  const { form, setField, togglePlatform, resetForm, isBudgetInverted } = useQuestionnaireForm();
  const allowed = useProjectCreatePermission();

  const goBack = (): void => {
    if (step > 1) {
      setShowFieldErrors(false);
      setStep(step - 1);
    }
  };

  const goNext = (): void => {
    if (step >= QUESTIONNAIRE_MAX_STEPS) return;

    // Block advancing while any required input of the current step is
    // empty/unset: alert the user about what needs to be filled and mark
    // the unfilled inputs with the error style until they are corrected.
    const stepError = validateStep(form, step);
    if (stepError) {
      setShowFieldErrors(true);
      console.error("error", stepError);
      return;
    }

    setShowFieldErrors(false);
    setStep(step + 1);
  };

  const handleSubmit = async (): Promise<void> => {
    const validationError = validateQuestionnaire(form);
    if (validationError) {
      // Mark unfilled inputs on the current step as well, then alert.
      setShowFieldErrors(true);
      console.error("error", validationError);
      return;
    }

    setSubmitting(true);

    const payload = toProjectCreatePayload(form);

    try {
      await projectService.create(payload);
      resetForm();
      setStep(1);
      console.log("success", "Projeto publicado com sucesso!");
      
    } catch (submitError) {
      console.error(
        "error",
        submitError instanceof Error ? submitError.message : "Não foi possível publicar o projeto.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (allowed === null) return null;

  return (
    <section className="relative mx-auto w-full px-2 sm:px-4 lg:px-8">
      <div className="bg-(--surface-1) border border-(--border-subtle) relative m-2 p-4 sm:m-4 sm:p-6">
        <div className="mb-4 border-b-2 border-(--primary) pb-3 sm:mb-6 sm:pb-4">
          <h2 className="gb-heading text-2xl sm:text-3xl">Criação de projetos</h2>
          <p className="gb-label text-(--gb-stone-600)">
            Descreva suas ideias e publique para programadores
          </p>
        </div>

        <QuestionnaireProgress currentStep={step} />

        <div className="mt-6">
          {step === 1 && <ProblemStep form={form} setField={setField} showFieldErrors={showFieldErrors} />}
          {step === 2 && <AudienceStep form={form} setField={setField} showFieldErrors={showFieldErrors} />}
          {step === 3 && <SolutionStep form={form} setField={setField} togglePlatform={togglePlatform} showFieldErrors={showFieldErrors}/>}
          {step === 4 && <DetailsStep form={form} setField={setField} isBudgetInverted={isBudgetInverted} showFieldErrors={showFieldErrors}/>}
          <QuestionnaireNavigation
            currentStep={step}
            isSubmitting={submitting}
            onBack={goBack}
            onNext={goNext}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </section>
  );
}
