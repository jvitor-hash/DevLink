import Select from "@/components/ui/select_component";
import TextArea from "@/components/ui/textarea_component";
import { audienceOptions } from "../questionnaire.constants";
import type { QuestionnaireStepProps } from "../questionnaire.types";
import type { Audience } from "@/lib/types/database";

/** Step 2 — audience definition questions. */
export function AudienceStep({ form, setField, showFieldErrors }: QuestionnaireStepProps) {
  return (
    <div>
      <div>
        <p>Quem são os principais usuários?</p>
        <Select
          labels={audienceOptions}
          name="audience"
          defaultValue={form.audience}
          onChange={(e) => setField("audience", e.currentTarget.value as Audience)}
        />
      </div>

      <TextArea
        label="Quais são os objetivos e os pontos de dor deles?"
        name="audiencePainPoints"
        value={form.audiencePainPoints}
        onChange={(e) => setField("audiencePainPoints", e.target.value)}
        error={showFieldErrors && form.audiencePainPoints.trim() === ""}
      />
      <TextArea
        label="Que suposições estamos fazendo sobre eles?"
        name="audienceAssumptions"
        value={form.audienceAssumptions}
        onChange={(e) => setField("audienceAssumptions", e.target.value)}
        error={showFieldErrors && form.audienceAssumptions.trim() === ""}
      />
      <TextArea
        label="Quem não é o usuário-alvo?"
        name="notAudience"
        value={form.notAudience}
        onChange={(e) => setField("notAudience", e.target.value)}
        error={showFieldErrors && form.notAudience.trim() === ""}
      />
    </div>
  );
}
