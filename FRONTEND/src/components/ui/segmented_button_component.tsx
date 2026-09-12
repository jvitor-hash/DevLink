import { useState } from "react";

type SegmentedButtonProps = {
  title?: string;
  items: Record<string, string>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
};

export function SegmentedButton({
  title,
  items,
  value,
  defaultValue,
  onChange,
  name = "segmented-button",
}: SegmentedButtonProps) {
  const firstItem = Object.keys(items)[0];

  const [internalValue, setInternalValue] = useState(
    defaultValue ?? firstItem
  );

  const selectedValue = value ?? internalValue;

  const handleChange = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  };

  return (
    <div>
      {title !== undefined && (
        <p className="mb-2">{title}</p>
      )}

      <div role="radiogroup" className="inline-flex w-full items-center rounded-md border border-(--border) bg-transparent p-1">
        {Object.entries(items).map(([state, label]) => {
          const isSelected = state === selectedValue;

          return (
            <label
              key={state}
              className={[
                "flex-1 cursor-pointer rounded-sm px-4 py-1.5 text-center text-sm font-medium",
                "transition-colors duration-150",
                "focus-within:ring-(--primary)",
                isSelected
                  ? "bg-(--primary) text-white"
                  : "bg-transparent text-(--primary) hover:bg-(--primary)/10",
              ].join(" ")}
            >
              <input type="radio" name={name} value={state} checked={isSelected} onChange={() => handleChange(state)} className="sr-only"/>
              {label}
            </label>
          );
        })}
      </div>
    </div>
  );
}