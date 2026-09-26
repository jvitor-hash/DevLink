import Checkbox from "@/components/form/checkbox_component";
import Select from "@/components/form/select_component";
import TextArea from "@/components/form/textarea_component";
import { platformOptions, primaryLanguageOptions } from "../questionnaire.constants";
import type { QuestionnairePlatformStepProps } from "../questionnaire.types";
import type { ProgrammingLanguage } from "@/data/types/database";

/** Step 3 — solution scope: requirements, platforms and language. */
export function SolutionStep({ form, setField, togglePlatform, showFieldErrors }: QuestionnairePlatformStepProps) {
  const platformsEmpty = showFieldErrors && form.platforms.length === 0;

  return (
    <div>
      <TextArea
        label="O que o produto deve realizar?"
        name="requirements"
        value={form.requirements}
        onChange={(e) => setField("requirements", e.target.value)}
        error={showFieldErrors && form.requirements.trim() === ""}
      />
      <TextArea
        label="Como é o sucesso?"
        name="successCriteria"
        value={form.successCriteria}
        onChange={(e) => setField("successCriteria", e.target.value)}
        error={showFieldErrors && form.successCriteria.trim() === ""}
      />
      <TextArea
        label="Qual é a proposta de valor central do produto?"
        name="valueProposition"
        value={form.valueProposition}
        onChange={(e) => setField("valueProposition", e.target.value)}
        error={showFieldErrors && form.valueProposition.trim() === ""}
      />
      <TextArea
        label="O que o diferencia das alternativas?"
        name="differentiation"
        value={form.differentiation}
        onChange={(e) => setField("differentiation", e.target.value)}
        error={showFieldErrors && form.differentiation.trim() === ""}
      />

      <div className="mt-2">
        <p className="mb-2">
          Plataformas: {platformsEmpty && <span className="text-(--error)">*</span>}
        </p>
        <div className="flex gap-4">
          {platformOptions.map(({ label, value }) => (
            <Checkbox
              key={value}
              label={label}
              checked={form.platforms.includes(value)}
              error={platformsEmpty}
              onToggle={(checked) => togglePlatform(value, checked)}
            />
          ))}
        </div>
      </div>

      <div>
        <p>Qual seria a linguagem de programacao principal?</p>
        <Select
          labels={primaryLanguageOptions}
          name="primaryLanguage"
          defaultValue={form.primaryLanguage}
          onChange={(e) => setField("primaryLanguage", e.currentTarget.value as ProgrammingLanguage)}
        />
      </div>
    </div>
  );
}
