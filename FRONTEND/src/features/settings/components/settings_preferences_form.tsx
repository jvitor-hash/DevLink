import { useState } from "react";
import { ULIB } from "@/shared/ui";
import type {
  UserPreferenceDTO,
  UserPreferenceUpdate,
  ProgrammingLanguage,
  PlatformType,
} from "@/shared/types/database";

interface SettingsPreferencesFormProps {
  preferences: UserPreferenceDTO | null;
  onSave: (data: UserPreferenceUpdate) => Promise<boolean>;
}

const LANGUAGES: Array<{ value: "ALL" | ProgrammingLanguage; label: string }> = [
  { value: "ALL", label: "Todas as linguagens" },
  { value: "TYPESCRIPT", label: "TypeScript" },
  { value: "JAVASCRIPT", label: "JavaScript" },
  { value: "PYTHON", label: "Python" },
  { value: "NODE_JS", label: "Node.js" },
  { value: "JAVA", label: "Java" },
  { value: "CSHARP", label: "C#" },
  { value: "GO", label: "Go" },
  { value: "PHP", label: "PHP" },
  { value: "RUST", label: "Rust" },
];

const PLATFORMS: Array<{ value: "ALL" | PlatformType; label: string }> = [
  { value: "ALL", label: "Todas as plataformas" },
  { value: "WEB", label: "Web" },
  { value: "MOBILE", label: "Mobile" },
  { value: "DESKTOP", label: "Desktop" },
];

export function SettingsPreferencesForm({
  preferences,
  onSave,
}: SettingsPreferencesFormProps) {
  const [lang, setLang] = useState<"ALL" | ProgrammingLanguage>(preferences?.language ?? "ALL");
  const [plat, setPlat] = useState<"ALL" | PlatformType>(preferences?.platform ?? "ALL");
  const [minBudget, setMinBudget] = useState(preferences?.minBudget ?? 500);
  const [maxBudget, setMaxBudget] = useState(preferences?.maxBudget ?? 10000);
  const [deadlineDays, setDeadlineDays] = useState(preferences?.maxDeadlineDays ?? "30");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      language: lang,
      platform: plat,
      minBudget: Number(minBudget),
      maxBudget: Number(maxBudget),
      maxDeadlineDays: String(deadlineDays),
    });
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-5 border border-(--border) bg-(--surface-1) rounded-md max-w-xl"
    >
      <div>
        <h3 className="text-base font-semibold text-(--text-primary)">Preferências de Projetos</h3>
        <p className="text-xs text-(--text-secondary) mt-1">
          Filtros padrão para sugerir projetos ideais ao seu perfil técnico e financeiro.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ULIB.field>
          <ULIB.label htmlFor="pref-lang">Linguagem Preferida</ULIB.label>
          <ULIB.select
            id="pref-lang"
            value={lang}
            onChange={(e: any) => setLang(e.target.value as any)}
          >
            {LANGUAGES.map((l) => (
              <ULIB.selectOption key={l.value} value={l.value}>
                {l.label}
              </ULIB.selectOption>
            ))}
          </ULIB.select>
        </ULIB.field>

        <ULIB.field>
          <ULIB.label htmlFor="pref-plat">Plataforma Preferida</ULIB.label>
          <ULIB.select
            id="pref-plat"
            value={plat}
            onChange={(e: any) => setPlat(e.target.value as any)}
          >
            {PLATFORMS.map((p) => (
              <ULIB.selectOption key={p.value} value={p.value}>
                {p.label}
              </ULIB.selectOption>
            ))}
          </ULIB.select>
        </ULIB.field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ULIB.field>
          <ULIB.label htmlFor="pref-minb">Orçamento Mínimo Desejado (R$)</ULIB.label>
          <ULIB.input
            id="pref-minb"
            type="number"
            value={minBudget}
            onChange={(e: any) => setMinBudget(Number(e.target.value))}
          />
        </ULIB.field>

        <ULIB.field>
          <ULIB.label htmlFor="pref-maxb">Orçamento Máximo (R$)</ULIB.label>
          <ULIB.input
            id="pref-maxb"
            type="number"
            value={maxBudget}
            onChange={(e: any) => setMaxBudget(Number(e.target.value))}
          />
        </ULIB.field>
      </div>

      <ULIB.field>
        <ULIB.label htmlFor="pref-days">Prazo Máximo de Entrega (dias)</ULIB.label>
        <ULIB.input
          id="pref-days"
          type="number"
          value={deadlineDays}
          onChange={(e: any) => setDeadlineDays(e.target.value)}
        />
      </ULIB.field>

      <div className="flex justify-end pt-2">
        <ULIB.button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar Preferências"}
        </ULIB.button>
      </div>
    </form>
  );
}
