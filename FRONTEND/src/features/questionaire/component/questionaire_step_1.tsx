import { ULIB } from "@/shared/ui";
import { subCategoriesList } from "@/shared/utils/sub_categories";
import type { QuestionaireFormData } from "../hooks/use_questionaire_form";

interface QuestionaireStepOneProps {
  data: QuestionaireFormData;
  onChange: (patch: Partial<QuestionaireFormData>) => void;
}

export default function QuestionaireStepOne({ data, onChange }: QuestionaireStepOneProps) {
  const currentCategoryObj = subCategoriesList.find((c) => c.value === data.category);
  const subCategories = currentCategoryObj
    ? currentCategoryObj.subCategories
    : subCategoriesList[0].subCategories;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-xl font-bold">Problema & Categoria</h3>
        <p className="text-sm text-(--text-secondary) mt-1">
          Defina em qual área seu projeto se encaixa e qual é o problema principal que ele resolverá.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ULIB.field>
          <ULIB.label htmlFor="q-cat" required>Categoria</ULIB.label>
          <ULIB.select
            id="q-cat"
            value={data.category}
            onChange={(e: any) => {
              const cat = e.target.value;
              const sub = subCategoriesList.find((c) => c.value === cat)?.subCategories[0]?.value || "";
              onChange({ category: cat, sub_category: sub });
            }}
          >
            {subCategoriesList.map((c) => (
              <ULIB.selectOption key={c.value} value={c.value}>
                {c.label}
              </ULIB.selectOption>
            ))}
          </ULIB.select>
        </ULIB.field>

        <ULIB.field>
          <ULIB.label htmlFor="q-subcat" required>Sub-Categoria</ULIB.label>
          <ULIB.select
            id="q-subcat"
            value={data.sub_category}
            onChange={(e: any) => onChange({ sub_category: e.target.value })}
          >
            {subCategories.map((s) => (
              <ULIB.selectOption key={s.value} value={s.value}>
                {s.label}
              </ULIB.selectOption>
            ))}
          </ULIB.select>
        </ULIB.field>
      </div>

      <ULIB.field>
        <ULIB.label htmlFor="q-problem" required>Qual problema este projeto resolve?</ULIB.label>
        <ULIB.textarea
          id="q-problem"
          rows={4}
          placeholder="Ex: Pequenos comércios perdem vendas por não terem cardápio digital integrado ao WhatsApp..."
          value={data.problem}
          onChange={(e: any) => onChange({ problem: e.target.value })}
          required
        />
      </ULIB.field>

      <ULIB.field>
        <ULIB.label htmlFor="q-actions">Quais ações o usuário deve realizar?</ULIB.label>
        <ULIB.textarea
          id="q-actions"
          rows={3}
          placeholder="Ex: Visualizar produtos, montar pedido, enviar comprovante..."
          value={data.user_actions}
          onChange={(e: any) => onChange({ user_actions: e.target.value })}
        />
      </ULIB.field>
    </div>
  );
}
