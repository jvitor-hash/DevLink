import MoneyInput from "@/components/form/money_input_component";
import Select from "@/components/form/select_component";
import type { ProjectFilters } from "@/data/types/project_filters";

type SearchFiltersLayoutProps = {
  value: ProjectFilters;
  onChange: (value: ProjectFilters) => void;
};

export default function SearchFiltersLayout({
  value,
  onChange,
}: SearchFiltersLayoutProps) {
  return (
    <>
      <div className="flex gap-10 mt-4 *:flex-1">
        <div className="flex flex-col">
          <p>Público-alvo:</p>
          <Select
            labels={{
              Todos: "ALL",
              Clientes: "CLIENTS",
              "Ferramenta Interna": "INTERNAL_TOOL",
              Estudantes: "STUDENTS",
              Negócios: "BUSINESSES",
              Administradores: "ADMINISTRATORS",
              Pesquisadores: "RESEARCHER",
            }}
            name="audience"
            value={value.audience}
            onChange={(e) =>
              onChange({ ...value, audience: e.currentTarget.value as ProjectFilters["audience"] })
            }
          />
        </div>

        <div className="flex flex-col">
          <p>Plataformas:</p>
          <Select
            labels={{
              Todas: "ALL",
              Web: "WEB",
              Desktop: "DESKTOP",
              Mobile: "MOBILE",
            }}
            name="platforms"
            value={value.platforms}
            onChange={(e) =>
              onChange({ ...value, platforms: e.currentTarget.value as ProjectFilters["platforms"] })
            }
          />
        </div>

        <div className="flex flex-col">
          <p>Linguagem:</p>
          <Select
            labels={{
              Todas: "ALL",
              "C#": "CSHARP",
              "Node.js": "NODE_JS",
              Java: "JAVA",
              Go: "GO",
              Python: "PYTHON",
              TypeScript: "TYPESCRIPT",
              JavaScript: "JAVASCRIPT",
              PHP: "PHP",
              Rust: "RUST",
              Kotlin: "KOTLIN",
              Swift: "SWIFT",
              Outro: "OTHER",
            }}
            name="primary_language"
            value={value.primaryLanguage}
            onChange={(e) =>
              onChange({ ...value, primaryLanguage: e.currentTarget.value as ProjectFilters["primaryLanguage"] })
            }
          />
        </div>

        <div className="flex flex-col">
          <p>Status:</p>
          <Select
            labels={{
              Todas: "ALL",
              Aberto: "OPEN",
              Negociação: "NEGOTIATING",
              "Em desenvolvimento": "IN_DEVELOPMENT",
              Concluído: "COMPLETED",
              Cancelado: "CANCELLED",
            }}
            name="status"
            value={value.status}
            onChange={(e) =>
              onChange({ ...value, status: e.currentTarget.value as ProjectFilters["status"] })
            }
          />
        </div>
      </div>

      <div className="flex flex-col">
        <p>Orçamento:</p>
        <div className="flex gap-4">
          <MoneyInput
            label=""
            name="minBudget"
            placeholder="Valor mínimo"
            value={value.minBudget}
            onChange={(digits) => onChange({ ...value, minBudget: digits })}
          />
          <MoneyInput
            label=""
            name="maxBudget"
            placeholder="Valor máximo"
            value={value.maxBudget}
            onChange={(digits) => onChange({ ...value, maxBudget: digits })}
          />
        </div>
      </div>
    </>
  );
}
