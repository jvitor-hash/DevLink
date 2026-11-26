const STEPS = [
  { num: 1, label: "Problema & Categoria" },
  { num: 2, label: "Solução & Descrição" },
  { num: 3, label: "Público-alvo" },
  { num: 4, label: "Orçamento & Execução" },
];

export function QuestionaireProgress({ currentStep, onStepClick}) {
  return (
    <div className="flex flex-col gap-3">
      {STEPS.map((s) => {
        const isCurrent = s.num === currentStep;
        const isDone = s.num < currentStep;

        return (
          <div
            key={s.num}
            onClick={() => onStepClick?.(s.num)}
            className={`flex items-center gap-3 p-3 border transition-colors ${
              isCurrent ? "border-(--primary) bg-(--surface-2)" : isDone ? "border-(--border-subtle) bg-(--surface-1) opacity-80"
                : "border-transparent opacity-40"
            } ${onStepClick ? "cursor-pointer" : ""}`}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center font-mono text-sm font-bold ${
                isCurrent ? "bg-(--primary) text-white" : isDone ? "bg-(--success) text-white" : "bg-(--surface-2) text-(--text-muted)"
              }`}
            >
              0{s.num}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-(--text-muted)">Passo 0{s.num}</span>
              <span className="text-sm font-medium text-(--text-primary)">{s.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
