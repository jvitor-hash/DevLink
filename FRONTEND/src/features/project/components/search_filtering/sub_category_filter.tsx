import { ULIB } from "@/shared/ui";
import { subCategoriesList } from "@/shared/utils/sub_categories";

export default function SearchSubCategoryFilter({ selectedCategory, value = "", onSelect }) {
  const currentCategoryObj = subCategoriesList.find((c) => c.value === selectedCategory);
  const subCategories = currentCategoryObj ? currentCategoryObj.subCategories 
  : subCategoriesList.flatMap((c) => c.subCategories);

  return (
    <ULIB.select value={value} onChange={(e: any) => onSelect(e.target.value)} aria-label="Filtrar por Sub-Categoria">
      <option value="">Todas as Sub-categorias</option>
      {subCategories.map((sub) => (
        <ULIB.selectOption key={sub.value} value={sub.value}>
          {sub.label}
        </ULIB.selectOption>
      ))}
    </ULIB.select>
  );
}
