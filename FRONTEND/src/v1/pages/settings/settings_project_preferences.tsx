import Input from "@/components/form/input_component";

type ProjectPreference = {
  maxDeadlineDays: string;
  maxBudget: number;
};

type SettingsProjectPreferencesProps = {
  preference?: ProjectPreference;
  onChange: (changes: Partial<ProjectPreference>) => void;
};

export default function SettingsProjectPreferences({ preference, onChange }: SettingsProjectPreferencesProps) {
  const value: ProjectPreference = preference ?? {
    maxDeadlineDays: "365",
    maxBudget: 0
  }

  return (
    <>
      <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-6">
        <h2 className="mb-4 text-xl font-semibold">Preferências de projetos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-(--text-muted)">
              Prazo máximo (dias)
            </label>
            <Input
              label=""
              name="maxDeadlineDays"
              inputType="number"
              value={ value.maxDeadlineDays }
              onChange={(e) =>
                onChange({ maxDeadlineDays: e.target.value || "365" })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-(--text-muted)">
              Orçamento máximo (R$)
            </label>
            <Input
              label=""
              name="maxBudget"
              inputType="number"
              value={ value.maxBudget === 0 ? "" : String(value.maxBudget) }
              onChange={(e) =>
                onChange({ maxBudget: Number(e.target.value) || 0 })
              }
            />
          </div>

          <p className="text-xs text-(--text-muted) sm:col-span-2">
            Deixe o orçamento máximo vazio para não filtrar por preço.
          </p>
        </div>
      </section>
    </>
  );
}
