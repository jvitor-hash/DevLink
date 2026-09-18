import Input from "@/components/ui/input_component";
import MoneyInput from "@/components/ui/money_input_component";
import Select from "@/components/ui/select_component";
import TextArea from "@/components/ui/textarea_component";
import { categoryOptions } from "../questionnaire.constants";
import type { QuestionnaireDetailsStepProps } from "../questionnaire.types";

/** Step 4 — publication details and budget. */
export function DetailsStep({
  form,
  setField,
  isBudgetInverted,
  showFieldErrors,
}: QuestionnaireDetailsStepProps) {
  return (
    <div>
      <Input
        label="Qual seria o titulo desse projeto?"
        name="title"
        value={form.title}
        onChange={(e) => setField("title", e.target.value)}
        error={showFieldErrors && form.title.trim() === ""}
      />
      <TextArea
        label="Descreva seu projeto em poucas palavras?"
        name="description"
        value={form.description}
        onChange={(e) => setField("description", e.target.value)}
        error={showFieldErrors && form.description.trim() === ""}
      />

      <div>
        <p className="">Qual a categoria do projeto?</p>
        <Select
          labels={categoryOptions}
          name="category"
          value={form.category}
          placeholder="Selecione uma categoria"
          onChange={(e) => setField("category", e.target.value)}
          error={showFieldErrors && form.category.trim() === ""}
        />
      </div>

      <Input
        label="Qual a sub-categoria do projeto?"
        name="subCategory"
        value={form.subCategory}
        onChange={(e) => setField("subCategory", e.target.value)}
        error={showFieldErrors && form.subCategory.trim() === ""}
      />

      <div className="flex gap-4">
        <MoneyInput
          label="Orçamento minimo (R$)"
          name="minBudget"
          value={form.minBudget}
          dataTestId="minBudget"
          onChange={(value) => setField("minBudget", value)}
          error={showFieldErrors && form.minBudget === ""}
        />
        <MoneyInput
          label="Orçamento maximo (R$)"
          name="maxBudget"
          value={form.maxBudget}
          dataTestId="maxBudget"
          onChange={(value) => setField("maxBudget", value)}
          error={showFieldErrors && form.maxBudget === ""}
        />
      </div>

      <div className="mt-4">
        <Input
          label="Prazo final do projeto"
          name="deadline"
          inputType="date"
          value={form.deadline}
          onChange={(e) => setField("deadline", e.target.value)}
          error={showFieldErrors && form.deadline === ""}
        />
      </div>

      {isBudgetInverted && (
        <p className="mt-3 text-(--error)">O orçamento maximo não pode ser menor que o minimo.</p>
      )}
    </div>
  );
}
