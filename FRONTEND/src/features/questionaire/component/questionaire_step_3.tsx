import { ULIB } from "@/shared/ui";
import type { QuestionaireFormData } from "../hooks/use_questionaire_form";

const AUDIENCES: Array<{ value; label: string }> = [
  { value: "CLIENTS", label: "Clientes / Consumidores Finais" },
  { value: "BUSINESSES", label: "Empresas e Negócios (B2B)" },
  { value: "INTERNAL_TOOL", label: "Equipe Interna / Ferramenta Interna" },
  { value: "STUDENTS", label: "Estudantes e Educadores" },
  { value: "ADMINISTRATORS", label: "Administradores de Sistemas" },
  { value: "RESEARCHER", label: "Pesquisadores e Acadêmicos" },
];

export function QuestionaireStepThree({ data, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-xl font-bold">Público-alvo & Escopo</h3>
        <p className="text-sm text-(--text-secondary) mt-1">
          Identifique quem utilizará seu sistema e quais são suas principais dores.
        </p>
      </div>

      <ULIB.field>
        <ULIB.label htmlFor="q-aud" required>Público Principal</ULIB.label>
        <ULIB.select id="q-aud" value={data.audience} onChange={(e: any) => onChange({ audience: e.target.value })}>
          {AUDIENCES.map((a) => (
            <ULIB.selectOption key={a.value} value={a.value}>
              {a.label}
            </ULIB.selectOption>
          ))}
        </ULIB.select>
      </ULIB.field>

      <ULIB.field>
        <ULIB.label htmlFor="q-pain">Principais Dores do Público</ULIB.label>
        <ULIB.textarea
          id="q-pain"
          rows={3}
          placeholder="Ex: Demora no atendimento, dificuldade em encontrar produtos, erros manuais..."
          value={data.audiencePainPoints}
          onChange={(e: any) => onChange({ audiencePainPoints: e.target.value })}
          error={null}
        />
      </ULIB.field>

      <ULIB.field>
        <ULIB.label htmlFor="q-notaud">Quem NÃO é o público deste projeto?</ULIB.label>
        <ULIB.input
          id="q-notaud"
          placeholder="Ex: Grandes redes de varejo, usuários sem acesso à internet..."
          value={data.notAudience}
          onChange={(e: any) => onChange({ notAudience: e.target.value })}
          error={null}
        />
      </ULIB.field>
    </div>
  );
}
