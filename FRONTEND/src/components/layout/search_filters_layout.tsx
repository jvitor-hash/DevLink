import MoneyInput from "@/components/ui/money_input_component";
import Select from "@/components/ui/select_component";
import type { ProjectFilters } from "@/lib/types/project_filters";

type SearchFiltersLayoutProps = {
  value: ProjectFilters;
  onChange: (value: ProjectFilters) => void;
}

export default function SearchFiltersLayout({ value, onChange }: SearchFiltersLayoutProps) {
    return (
        <>
            <div className="flex gap-10 mt-4 *:flex-1">
                <div className="flex flex-col">
                    <p>Público-alvo:</p>
                    <Select
            labels={{ "Todos": "ALL", "Clientes": "CLIENTS", "Ferramenta Interna": "INTERNAL_TOOL" }}
            name="audience"
            defaultValue={value.audience}
            onChange={(e) => onChange({ ...value, audience: e.currentTarget.value })}
          />
                </div>

                <div className="flex flex-col">
                    <p>Plataformas:</p>
                    <Select
            labels={{ "Todas": "ALL", Web: "WEB", Desktop: "DESKTOP", Mobile: "MOBILE" }}
            name="platforms"
            defaultValue={value.platforms}
            onChange={(e) => onChange({ ...value, platforms: e.currentTarget.value })}
          />
                </div>

                <div className="flex flex-col">
                    <p>Linguagem:</p>
                    <Select
            labels={{ "Todas": "ALL", Python: "PYTHON", Typescript: "TYPESCRIPT", "C#": "CSHARP" }}
            name="primary_language"
            defaultValue={value.primaryLanguage}
            onChange={(e) => onChange({ ...value, primaryLanguage: e.currentTarget.value })}
          />
                </div>

                <div className="flex flex-col">
                    <p>Status:</p>
                    <Select
            labels={{ "Todas": "ALL", "Em-aberto": "OPEN", Negociação: "NEGOTIATING", "Em desenvolvimento": "IN_DEVELOPMENT", "Concluído": "COMPLETED", Cancelado: "CANCELLED" }}
            name="status"
            defaultValue={value.status}
            onChange={(e) => onChange({ ...value, status: e.currentTarget.value })}
          />
                </div>
            </div>

            <div className="flex flex-col">
                <p>Orçamento:</p>
                <div className="flex gap-4">
          <MoneyInput label="" name="minBudget" placeholder="Valor mínimo" value={value.minBudget} onChange={(digits) => onChange({ ...value, minBudget: digits })} />
          <MoneyInput label="" name="maxBudget" placeholder="Valor máximo" value={value.maxBudget} onChange={(digits) => onChange({ ...value, maxBudget: digits })} />
                </div>
            </div>
        </>
    )
}