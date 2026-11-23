import { ULIB } from "@/shared/ui";
import { X } from "react-feather";

export function ActiveFiltersBanner(filters, onRemoveFilter, onClearAll) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border border-(--border-subtle) bg-(--surface-1) text-sm w-full">
      <span className="text-xs text-(--text-muted) font-medium">Filtros ativos:</span>

      {filters.map((item) => {
        <ULIB.badge>
          <div className="flex justify-between">
            <div>{item.name}</div>
            <div><X size={18} onClick={onRemoveFilter} /></div>
          </div>
        </ULIB.badge>
      })}

      <button type="button" onClick={onClearAll} className="text-xs text-(--error) hover:underline ml-auto cursor-pointer">
        Limpar todos
      </button>
    </div>
  );
}
