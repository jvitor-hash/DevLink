import { ULIB } from "@/shared/ui";
import { homeCategories } from "@/shared/utils/home_categories";

interface SearchSubCategoryFilterProps {
  selectedCategory?: string;
  value?: string;
  onSelect: (subCategory: string) => void;
}

export default function SearchSubCategoryFilter({
  selectedCategory,
  value = "",
  onSelect,
}: SearchSubCategoryFilterProps) {
  const currentCategoryObj = homeCategories.find((c) => c.value === selectedCategory);
  const subCategories = currentCategoryObj
    ? currentCategoryObj.subCategories
    : homeCategories.flatMap((c) => c.subCategories);

  return (
    <ULIB.select
      value={value}
      onChange={(e: any) => onSelect(e.target.value)}
      aria-label="Filtrar por Sub-Categoria"
    >
      <option value="">Todas as Sub-categorias</option>
      {subCategories.map((sub) => (
        <ULIB.selectOption key={sub.value} value={sub.value}>
          {sub.label}
        </ULIB.selectOption>
      ))}
    </ULIB.select>
  );
}
