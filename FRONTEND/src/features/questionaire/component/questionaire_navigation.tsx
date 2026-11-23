import { ULIB } from "@/shared/ui";
import { ArrowLeft, ArrowRight, Check } from "react-feather";

interface QuestionaireNavigationProps {
  step: number;
  totalSteps?: number;
  submitting?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function QuestionaireNavigation({
  step,
  totalSteps = 4,
  submitting = false,
  onPrev,
  onNext,
  onSubmit,
}: QuestionaireNavigationProps) {
  const isLast = step === totalSteps;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-(--border-subtle) mt-4">
      {step > 1 ? (
        <ULIB.button
          type="button"
          tone="secondary"
          onClick={onPrev}
          disabled={submitting}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Voltar
        </ULIB.button>
      ) : (
        <div />
      )}

      {isLast ? (
        <ULIB.button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center gap-2"
        >
          <Check size={16} /> {submitting ? "Publicando..." : "Publicar Projeto"}
        </ULIB.button>
      ) : (
        <ULIB.button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2"
        >
          Próximo <ArrowRight size={16} />
        </ULIB.button>
      )}
    </div>
  );
}
