import { ULIB } from "@/shared/ui";

const PLATFORMS: Array<{ value; label: string }> = [
  { value: "WEB", label: "Web" },
  { value: "MOBILE", label: "Mobile" },
  { value: "DESKTOP", label: "Desktop" },
];

const LANGUAGES: Array<{ value; label: string }> = [
  { value: "TYPESCRIPT", label: "TypeScript" },
  { value: "JAVASCRIPT", label: "JavaScript" },
  { value: "PYTHON", label: "Python" },
  { value: "NODE_JS", label: "Node.js" },
  { value: "JAVA", label: "Java" },
  { value: "CSHARP", label: "C#" },
  { value: "GO", label: "Go" },
  { value: "PHP", label: "PHP" },
  { value: "RUST", label: "Rust" },
  { value: "OTHER", label: "Outro" },
];

export function QuestionaireStepFour({ data, onChange }) {
  const togglePlatform = (plat) => {
    const exists = data.platforms.includes(plat);
    const updated = exists ? data.platforms.filter((p) => p !== plat) : [...data.platforms, plat];
    onChange({ platforms: updated });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-xl font-bold">Orçamento & Execução</h3>
        <p className="text-sm text-(--text-secondary) mt-1">
          Defina as expectativas técnicas, faixas de investimento e prazos desejados.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-(--text-primary)">
          Plataformas Suportadas <span className="text-(--error)">*</span>
        </label>
        <div className="flex gap-4">
          {PLATFORMS.map((plat) => {
            const checked = data.platforms.includes(plat.value);
            return (
              <label
                key={plat.value}
                className={`flex items-center gap-2 px-3 py-2 border cursor-pointer transition-colors ${
                  checked ? "border-(--primary) bg-(--surface-2)" : "border-(--border-subtle)"
                }`}
              >
                <input type="checkbox" checked={checked} onChange={() => togglePlatform(plat.value)} className="appearance-none"/>
                <span className="text-sm">{plat.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <ULIB.field>
        <ULIB.label htmlFor="q-lang">Linguagem Principal Preferida</ULIB.label>
        <ULIB.select id="q-lang" value={data.primaryLanguage} onChange={(e: any) => onChange({ primaryLanguage: e.target.value })}>
          {LANGUAGES.map((l) => (
            <ULIB.selectOption key={l.value} value={l.value}>
              {l.label}
            </ULIB.selectOption>
          ))}
        </ULIB.select>
      </ULIB.field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ULIB.field>
          <ULIB.label htmlFor="q-minb" required>Orçamento Mínimo (R$)</ULIB.label>
          <ULIB.input id="q-minb" type="number" value={data.minBudget}
            onChange={(e: any) => onChange({ minBudget: Number(e.target.value) })}
            required error={null}
          />
        </ULIB.field>

        <ULIB.field>
          <ULIB.label htmlFor="q-maxb" required>Orçamento Máximo (R$)</ULIB.label>
          <ULIB.input id="q-maxb" type="number" value={data.maxBudget}
            onChange={(e: any) => onChange({ maxBudget: Number(e.target.value) })}
            required error={null}
          />
        </ULIB.field>
      </div>

      <ULIB.field>
        <ULIB.label htmlFor="q-deadline">Prazo Desejado</ULIB.label>
        <ULIB.input id="q-deadline" type="date" value={data.deadline} 
          onChange={(e: any) => onChange({ deadline: e.target.value })} 
          error={null}
        />
      </ULIB.field>
    </div>
  );
}
