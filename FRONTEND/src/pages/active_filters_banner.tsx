import { useNavigate } from "react-router-dom";

type ActiveFiltersBannerProps = {
  category: string;
  subCategory: string;
};

/** True when the filter value is absent or the sentinel meaning "no filter". */
const isUnset = (value: string): boolean => value === "" || value === "ALL";

/**
 * Banner above the project list showing the category/sub_category filter
 * applied via URL deep link (home category cards). Each active filter can
 * be cleared individually; clearing navigates back to the unfiltered list.
 */
export function ActiveFiltersBanner({ category, subCategory }: ActiveFiltersBannerProps) {
  const navigate = useNavigate();

  const hasCategory = !isUnset(category);
  const hasSubCategory = !isUnset(subCategory);

  if (!hasCategory && !hasSubCategory) return null;

  const updateParams = (next: { category?: string | null; sub_category?: string | null }): void => {
    const search = new URLSearchParams();

    const nextCategory = next.category !== undefined ? next.category : hasCategory ? category : null;
    const nextSubCategory = next.sub_category !== undefined ? next.sub_category : hasSubCategory ? subCategory : null;

    if (nextCategory) search.set("category", nextCategory);
    if (nextSubCategory) search.set("sub_category", nextSubCategory);

    const query = search.toString();

    navigate(query ? `/project?${query}` : "/project", { replace: true });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 mt-5" data-testid="active-filters-banner">
      <span className="text-sm text-(--text-muted)">Filtrando por:</span>

      {hasCategory && (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-(--primary) px-3 py-1 text-sm text-white hover:cursor-pointer"
          onClick={() => updateParams({ category: null, sub_category: null })}
          data-testid="clear-category-filter"
        >
          {category}
          <span aria-hidden="true">×</span>
        </button>
      )}

      {hasSubCategory && (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-(--surface-2) px-3 py-1 text-sm text-(--text-primary) hover:cursor-pointer"
          onClick={() => updateParams({ sub_category: null })}
          data-testid="clear-sub-category-filter"
        >
          {subCategory}
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}
