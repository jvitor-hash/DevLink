import { ULIB } from "@/shared/ui";
import type { QuestionaireFormData } from "../hooks/use_questionaire_form";

interface QuestionaireStepTwoProps {
  data: QuestionaireFormData;
  onChange: (patch: Partial<QuestionaireFormData>) => void;
}

export function QuestionaireStepTwo({ data, onChange }: QuestionaireStepTwoProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-xl font-bold">Solução Proposta</h3>
        <p className="text-sm text-(--text-secondary) mt-1">
          Dê um nome ao seu projeto e descreva como sua solução funcionará na prática.
        </p>
      </div>

      <ULIB.field>
        <ULIB.label htmlFor="q-title" required>Título do Projeto</ULIB.label>
        <ULIB.input
          id="q-title"
          placeholder="Ex: Plataforma de Cardápio Digital para Comércios Locais"
          value={data.title}
          onChange={(e: any) => onChange({ title: e.target.value })}
          required
        />
      </ULIB.field>

      <ULIB.field>
        <ULIB.label htmlFor="q-desc" required>Descrição Geral</ULIB.label>
        <ULIB.textarea
          id="q-desc"
          rows={4}
          placeholder="Apresente um resumo detalhado da sua ideia para que os programadores entendam o objetivo..."
          value={data.description}
          onChange={(e: any) => onChange({ description: e.target.value })}
          required
        />
      </ULIB.field>

      <ULIB.field>
        <ULIB.label htmlFor="q-north">Pergunta Central (North Star)</ULIB.label>
        <ULIB.input
          id="q-north"
          placeholder="Ex: Como podemos reduzir o tempo de fechamento de pedidos em 50%?"
          value={data.northQuestion}
          onChange={(e: any) => onChange({ northQuestion: e.target.value })}
        />
      </ULIB.field>

      <ULIB.field>
        <ULIB.label htmlFor="q-hypo">Hipótese ou Proposta de Valor</ULIB.label>
        <ULIB.textarea
          id="q-hypo"
          rows={2}
          placeholder="Ex: Se criarmos uma interface direta sem necessidade de download, a conversão de pedidos aumentará..."
          value={data.hypothesis}
          onChange={(e: any) => onChange({ hypothesis: e.target.value })}
        />
      </ULIB.field>
    </div>
  );
}
