import Button from "@/components/ui/button_component";
import { QUESTIONNAIRE_MAX_STEPS } from "./questionnaire.constants";

type QuestionnaireNavigationProps = {
  currentStep: number;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

/**
 * Wizard footer: back/next navigation. The primary action flips to
 * "Publicar" on the last step and is disabled while submitting.
 */
export function QuestionnaireNavigation({
  currentStep,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
}: QuestionnaireNavigationProps) {
  const isLastStep = currentStep === QUESTIONNAIRE_MAX_STEPS;

  return (
    <div className="flex flex-row-reverse gap-4 mt-5">
      <Button
        label={isLastStep ? "Publicar" : "Proximo"}
        buttonType="button"
        colorType="primary"
        disabled={isSubmitting}
        dataTestId="questionnaire-next"
        onClick={isLastStep ? onSubmit : onNext}
      />
      <Button
        label="Voltar"
        buttonType="button"
        colorType="secondary"
        disabled={currentStep === 1}
        dataTestId="questionnaire-back"
        onClick={onBack}
      />
    </div>
  );
}
