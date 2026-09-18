import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/card_component";
import { homeCategories } from "./home_categories";

/**
 * Home page category browser. Clicking a card or a sub-category chip
 * navigates to the projects page with the matching filter pre-applied
 * via URL params (?category=...&sub_category=...).
 */
export function CategoryCards() {
  const navigate = useNavigate();

  const goToProjects = (params: { category?: string; sub_category?: string }): void => {
    const search = new URLSearchParams();

    if (params.category) search.set("category", params.category);
    if (params.sub_category) search.set("sub_category", params.sub_category);

    navigate(`/project?${search.toString()}`);
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {Object.entries(homeCategories).map(([category, subCategories]) => (
        <Card
          key={category}
          className="w-full max-w-xs"
          onClick={() => goToProjects({ category })}
        >
          <div className="h-full">
            <h3 className="text-lg font-bold text-(--text-primary) mb-3">{category}</h3>

            <ul className="flex flex-wrap gap-2">
              {subCategories.map((subCategory) => (
                <li key={subCategory}>
                  <button
                    type="button"
                    className="rounded-sm bg-(--surface-2) px-2 py-1 text-xs text-(--text-secondary) hover:text-white transition-colors hover:cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToProjects({ category, sub_category: subCategory });
                    }}
                  >
                    {subCategory}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ))}
    </div>
  );
}
