import { Steps } from "@/components/form/steps_component";

type QuestionnaireProgressProps = {
  currentStep: number;
};

/** Progress indicator for the questionnaire wizard. */
export function QuestionnaireProgress({ currentStep }: QuestionnaireProgressProps) {
  return (
    <div className="flex gap-4 mt-4">
      <Steps currentStep={currentStep}>
        <Steps.Item step={1}>
          <Steps.Indicator />
        </Steps.Item>
        <Steps.Item step={2}>
          <Steps.Indicator />
        </Steps.Item>
        <Steps.Item step={3}>
          <Steps.Indicator />
        </Steps.Item>
        <Steps.Item step={4}>
          <Steps.Indicator />
        </Steps.Item>
      </Steps>
    </div>
  );
}
