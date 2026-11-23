import { ULIB } from "@/shared/ui";
import useSearchFilter from "../../hooks/useSearchFilter";
import SearchCategoryFilter from "./catergory_filter";
import SearchProjectBudgetFilter from "./project_budget_filter";
import SearchProjectPlatformFilter from "./project_platform_filter";
import SearchProjectPublicFilter from "./project_public_filter";
import SearchProjectStatusFilter from "./project_status_filter";
import SearchSubCategoryFilter from "./sub_category_filter";

export default function SearchFiltering() {
    const { filters, updateFilters, applyFilters, clearFilters } = useSearchFilter();

    const currentCategory = typeof filters?.category === "string" ? filters.category : undefined;

    return (
        <aside className="w-72 shrink-0 p-4 border border-(--border) flex flex-col gap-3">
            <h3 className="font-semibold text-lg">Filtros</h3>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-(--text-secondary)">Categoria</span>
                <SearchCategoryFilter
                    value={currentCategory}
                    onSelect={(e) => updateFilters("category", e)}
                />
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-(--text-secondary)">Sub-Categoria</span>
                <SearchSubCategoryFilter
                    selectedCategory={currentCategory}
                    value={typeof filters?.sub_category === "string" ? filters.sub_category : undefined}
                    onSelect={(e) => updateFilters("sub_category", e)}
                />
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-(--text-secondary)">Público-alvo</span>
                <SearchProjectPublicFilter
                    value={typeof filters?.audience === "string" ? filters.audience : undefined}
                    onSelect={(e) => updateFilters("audience", e)}
                />
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-(--text-secondary)">Plataformas</span>
                <SearchProjectPlatformFilter
                    value={typeof filters?.platforms === "string" ? filters.platforms : undefined}
                    onSelect={(e) => updateFilters("platforms", e)}
                />
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-(--text-secondary)">Status</span>
                <SearchProjectStatusFilter
                    value={typeof filters?.status === "string" ? filters.status : undefined}
                    onSelect={(e) => updateFilters("status", e)}
                />
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-(--text-secondary)">Orçamento</span>
                <SearchProjectBudgetFilter
                    minBudget={filters?.minBudget as any}
                    maxBudget={filters?.maxBudget as any}
                    onChange={(min, max) => {
                        updateFilters("minBudget", min !== undefined ? String(min) : undefined);
                        updateFilters("maxBudget", max !== undefined ? String(max) : undefined);
                    }}
                />
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <ULIB.button onClick={applyFilters}>Pesquisar</ULIB.button>
                <ULIB.button tone="secondary" onClick={clearFilters}>Limpar filtros</ULIB.button>
            </div>
        </aside>
    );
}
