import { ULIB } from "@/v2/shared/ui";
import useSearchFilter from "../../hooks/useSearchFilter";
import SearchCategoryFilter from "./catergory_filter";
import SearchProjectBudgetFilter from "./project_budget_filter";
import SearchProjectPlatformFilter from "./project_platform_filter";
import SearchProjectPublicFilter from "./project_public_filter";
import SearchProjectStatusFilter from "./project_status_filter";
import SearchSubCategoryFilter from "./sub_category_filter";

export default function SearchFiltering() {
    const [ updateFilters, applyFilters, clearFilters] = useSearchFilter();

    return (
        <>
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <p>Categoria</p>
                    <SearchCategoryFilter onSelect={(e) => updateFilters("category", e)}/>
                </div>

                <div className="flex flex-col gap-1">
                    <p>Sub-Categoria</p>
                    <SearchSubCategoryFilter onSelect={(e) => updateFilters("sub-category", e)}/>
                </div>

                <div className="flex flex-col gap-1">
                    <p>Público-alvo</p>
                    <SearchProjectPublicFilter onSelect={(e) => updateFilters("public", e)}/>
                </div>

                <div className="flex flex-col gap-1">
                    <p>Plataformas</p>
                    <SearchProjectPlatformFilter onSelect={(e) => updateFilters("platform", e)}/>
                </div>

                <div className="flex flex-col gap-1">
                    <p>Status</p>
                    <SearchProjectStatusFilter onSelect={(e) => updateFilters("status", e)}/>
                </div>

                <div className="flex flex-col gap-1">
                    <p>Orçamento</p>
                    <SearchProjectBudgetFilter onChange={(min, max) => {
                        updateFilters("min-budget", toString(min))
                        updateFilters("max-budget", toString(max))
                    }}/>
                </div>

                <ULIB.button onClick={applyFilters}>Pesquisar</ULIB.button>
                <ULIB.button tone="secondary" onClick={clearFilters}>Limpar filtros</ULIB.button>
            </div>
        </>
    );
}