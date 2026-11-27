import { useQuestionaireForm } from "../hooks/use_questionaire_form";
import { QuestionaireProgress } from "./questionaire_progress";
import { QuestionaireNavigation } from "./questionaire_navigation";
import QuestionaireStepOne from "./questionaire_step_1";
import { QuestionaireStepTwo } from "./questionaire_step_2";
import { QuestionaireStepThree } from "./questionaire_step_3";
import { QuestionaireStepFour } from "./questionaire_step_4";

export function QuestionaireWizard() {
  const { step, goToStep, formData, updateFields, nextStep, prevStep, submitProject, submitting } = useQuestionaireForm();

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full mx-auto p-4">
      {/* Form Steps Card */}
      <div className="flex-1 border border-(--border) bg-(--surface-1) p-6 shadow-sm flex flex-col justify-between">
        <div>
          {step === 1 && (
            <QuestionaireStepOne data={formData} onChange={updateFields} />
          )}
          {step === 2 && (
            <QuestionaireStepTwo data={formData} onChange={updateFields} />
          )}
          {step === 3 && (
            <QuestionaireStepThree data={formData} onChange={updateFields} />
          )}
          {step === 4 && (
            <QuestionaireStepFour data={formData} onChange={updateFields} />
          )}
        </div>

        <QuestionaireNavigation step={step} submitting={submitting} onPrev={prevStep} onNext={nextStep} onSubmit={submitProject} />
      </div>

      {/* Progress Sidebar */}
      <div className="w-full lg:w-72 shrink-0">
        <QuestionaireProgress currentStep={step} onStepClick={goToStep} />
      </div>
    </div>
  );
}
