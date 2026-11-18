import { ULIB } from "@/shared/ui";
import { mapValueLabel } from "@/shared/utils/value_labels";
import { X } from "react-feather";

interface ActiveFiltersBannerProps {
  filters: Record<string, string | string[] | undefined>;
  onRemoveFilter: (key: string, itemValue?: string) => void;
  onClearAll: () => void;
}

export function ActiveFiltersBanner({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersBannerProps) {
  const activeEntries = Object.entries(filters).filter(
    ([, val]) => val !== undefined && val !== "" && (Array.isArray(val) ? val.length > 0 : true)
  );

  if (activeEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border border-(--border-subtle) bg-(--surface-1) text-sm w-full">
      <span className="text-xs text-(--text-muted) font-medium">Filtros ativos:</span>

      {activeEntries.map(([key, val]) => {
        if (Array.isArray(val)) {
          return val.map((item) => (
            <ULIB.badge key={`${key}-${item}`} tone="brand">
              <span className="flex items-center gap-1">
                {mapValueLabel(item)}
                <button
                  type="button"
                  onClick={() => onRemoveFilter(key, item)}
                  className="hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            </ULIB.badge>
          ));
        }

        return (
          <ULIB.badge key={key} tone="brand">
            <span className="flex items-center gap-1">
              {mapValueLabel(String(val))}
              <button
                type="button"
                onClick={() => onRemoveFilter(key)}
                className="hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          </ULIB.badge>
        );
      })}

      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-(--error) hover:underline ml-auto cursor-pointer"
      >
        Limpar todos
      </button>
    </div>
  );
}
