"use client";

import { useState } from "react";

type SegmentedButtonProps = {
  title?: string
  items: Record<string, string>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

export function SegmentedButton({ title, items, value, defaultValue, onChange }: SegmentedButtonProps) {
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
    <>
      {title !== undefined && (
        <>
          <p className="mb-2">{title}</p>
        </>
      )}
      <div role="group" className="inline-flex items-center rounded-md border border-(--border) w-full bg-transparent p-1">
        {Object.entries(items).map(([state, label]) => {
        const isSelected = state === selectedValue;
          return (
            <button
              key={state}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleChange(state)}
              className={[
                "flex-1 rounded-sm px-4 py-1.5 text-sm font-medium",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring(--primary)",
                isSelected
                  ? "bg-(--primary) text-white"
                  : "bg-transparent text-(--primary) hover:bg-(--primary)/10",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
    </>
  );
}
