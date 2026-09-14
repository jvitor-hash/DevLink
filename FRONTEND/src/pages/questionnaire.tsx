import Button from "@/components/ui/button_component";
import { Steps } from "@/components/ui/steps_component";
import { authService } from "@/services/auth_service";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Questionnaire() {
  const [steps, setStep] = useState<number>(1);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const maxSteps = 4;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const checkPermission = async (): Promise<void> => {
      try {
        const hasPermission = await authService.hasPermission({ projects: ["create"] });
        if (cancelled) return;

        if (hasPermission) {
          setAllowed(true);
          return;
        }

        navigate("/", { state: { from: location } });
      } catch {
        if (!cancelled) navigate("/", { state: { from: location } });
      }
    };

    checkPermission();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleBackStep = (): void => {
    if (steps > 1)
      setStep(steps - 1);
  };

  const handleNextStep = (): void => {
    if (steps < maxSteps)
      setStep(steps + 1);
  };

  if (allowed === null) return null;

  return (
    <>
      <div className="mx-4 mt-2 min-w-auto bg-(--surface-1) p-4 rounded-sm border border-(--border)">
        <div className="mt-4">
          <h2 className="text-2xl w-full text-center">Ideação de projetos</h2>
          <p className="text-base text-(--text-muted) text-center">
            Descreva suas ideas aqui e publique para possiveis programadores
          </p>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <Steps currentStep={steps}>
            <Steps.Item>
              <Steps.Indicator />
              <span className="mt-2 text-sm">Defina o problema</span>
            </Steps.Item>

            <Steps.Item>
              <Steps.Indicator />
              <span className="mt-2 text-sm">Definição de publíco-alvo</span>
            </Steps.Item>

            <Steps.Item>
              <Steps.Indicator />
              <span className="mt-2 text-sm">Defina a visão do produto</span>
            </Steps.Item>

            <Steps.Item>
              <Steps.Indicator />
              <span className="mt-2 text-sm">Finalização</span>
            </Steps.Item>
          </Steps>
        </div>
        
        {steps === 1 && (
            <div>
                <h1>test</h1>
            </div>
        )}

        <div className="flex flex-row-reverse gap-4">
          <Button label="Proximo" buttonType="button" colorType="primary" onClick={handleNextStep} disabled={steps === maxSteps} />
          <Button label="Voltar" buttonType="button" colorType="secondary" onClick={handleBackStep} disabled={steps === 1} />
        </div>
      </div>
    </>
  );
}
