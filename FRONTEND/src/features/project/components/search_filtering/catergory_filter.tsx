import { ULIB } from "@/shared/ui";
import { subCategoriesList } from "@/shared/utils/sub_categories";

export default function SearchCategoryFilter({ value = "", onSelect }) {
  return (
    <ULIB.select
      value={value}
      onChange={(e: any) => onSelect(e.target.value)}
      aria-label="Filtrar por Categoria"
    >
      <option value="">Todas as Categorias</option>
      {subCategoriesList.map((cat) => (
        <ULIB.selectOption key={cat.value} value={cat.value}>
          {cat.label}
        </ULIB.selectOption>
      ))}
    </ULIB.select>
  );
}
