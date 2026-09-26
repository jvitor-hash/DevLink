import { useNavigate } from "react-router-dom";
import type { ProjectFilters } from "@/data/types/project_filters";

type ActiveFiltersBannerProps = {
  filters: ProjectFilters;
};

/** True when the filter value is absent or the sentinel meaning "no filter". */
const isUnset = (value: string): boolean => value === "" || value === "ALL";

/**
 * Banner above the project list showing the category/sub_category filter
 * applied via URL deep link (home category cards). Each active filter can
 * be cleared individually; clearing navigates back to the unfiltered list.
 */
export function ActiveFiltersBanner({ filters }: ActiveFiltersBannerProps) {
  const navigate = useNavigate();
  const activeFilters = Object.entries(filters).filter(([, value]) => !isUnset(value));

  if (!activeFilters.length) return null;

  const removeFilter = (key: string): void => {
    const search = new URLSearchParams();
    for (const [currentKey, value] of Object.entries(filters)) {
      if (currentKey !== key && !isUnset(value)) search.set(currentKey, value);
    }

    const query = search.toString();

    navigate(query ? `/project?${query}` : "/project", { replace: true });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 mt-5" data-testid="active-filters-banner">
      <span className="text-sm text-(--text-muted)">Filtros ativos:</span>
      {activeFilters.map(([key, value]) => (
        <button key={key} type="button" className="inline-flex items-center gap-2 rounded-full bg-(--primary) px-3 py-1 text-sm text-white hover:cursor-pointer" onClick={() => removeFilter(key)} data-testid={`clear-${key}-filter`}>
          {key}: {value} <span aria-hidden="true">×</span>
        </button>
      ))}
      <button type="button" className="px-2 py-1 text-xs text-(--text-muted) underline hover:cursor-pointer" onClick={() => navigate("/project", { replace: true })}>
        Limpar tudo
      </button>
    </div>
  );
}
