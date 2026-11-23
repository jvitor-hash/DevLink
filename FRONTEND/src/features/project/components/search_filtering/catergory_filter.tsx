import { ULIB } from "@/shared/ui";
import { homeCategories } from "@/shared/utils/home_categories";

interface SearchCategoryFilterProps {
  value?: string;
  onSelect: (category: string) => void;
}

export default function SearchCategoryFilter({ value = "", onSelect }: SearchCategoryFilterProps) {
  return (
    <ULIB.select
      value={value}
      onChange={(e: any) => onSelect(e.target.value)}
      aria-label="Filtrar por Categoria"
    >
      <option value="">Todas as Categorias</option>
      {homeCategories.map((cat) => (
        <ULIB.selectOption key={cat.value} value={cat.value}>
          {cat.label}
        </ULIB.selectOption>
      ))}
    </ULIB.select>
  );
}
