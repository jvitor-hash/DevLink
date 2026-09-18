import TextArea from "@/components/ui/textarea_component";
import type { QuestionnaireStepProps } from "../questionnaire.types";

type ProblemStepProps = QuestionnaireStepProps;

/** Step 1 — problem framing questions. */
export function ProblemStep({ form, setField, showFieldErrors }: ProblemStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <TextArea
        label="Qual é o problema a ser resolvido?"
        name="problem"
        value={form.problem}
        onChange={(e) => setField("problem", e.target.value)}
        placeholder="Digite suas ideas sobre a resolusão de seu projeto..."
        error={showFieldErrors && form.problem.trim() === ""}
      />
      <TextArea
        label="Quem é mais afetado por esse problema?"
        name="affected"
        value={form.affectedUsers}
        onChange={(e) => setField("affectedUsers", e.target.value)}
        placeholder="Escreva sobre quem é mais afetado com esse problema..."
        error={showFieldErrors && form.affectedUsers.trim() === ""}
      />
      <TextArea
        label="Qual é a questão norte do projeto?"
        name="northQuestion"
        value={form.northQuestion}
        onChange={(e) => setField("northQuestion", e.target.value)}
        placeholder="Ex: “Como podemos reduzir o desperdício de água na escola por meio de ações de conscientização e mudanças de hábitos?”"
        error={showFieldErrors && form.northQuestion.trim() === ""}
      />
      <TextArea
        label="Qual seriá a sua hipótese sobre o problema?"
        name="hypothesis"
        value={form.hypothesis}
        onChange={(e) => setField("hypothesis", e.target.value)}
        placeholder="Escreva sobre affirmações testáveis do problema"
        error={showFieldErrors && form.hypothesis.trim() === ""}
      />
    </div>
  );
}
