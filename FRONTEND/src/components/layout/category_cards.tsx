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
    <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
      {homeCategories.map((category) => (
        <Card
          key={category.value}
          className="w-full justify-self-center"
          onClick={() => goToProjects({ category: category.value })}
        >
          <div>
            <h3 className="text-lg font-bold text-(--text-primary)">{category.label}</h3>

            <ul className="flex flex-col gap-2 mt-2">
              {category.subCategories.map((subCategory) => (
                <li key={subCategory.value}>
                  <button
                    type="button"
                    className="rounded-sm bg-(--surface-2) px-2 py-1 text-xs text-(--text-secondary) hover:text-white transition-colors hover:cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToProjects({ category: category.value, sub_category: subCategory.value });
                    }}
                  >
                    {subCategory.label}
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
