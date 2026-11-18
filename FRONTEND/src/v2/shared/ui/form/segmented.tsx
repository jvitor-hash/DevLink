import { Children, cloneElement, isValidElement, type ReactNode } from "react";

export interface SegmentedProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  name?: string;
}

export function Segmented({ value, onChange, children, name = "segmented" }: SegmentedProps) {
  return (
    <div role="radiogroup" className="inline-flex w-full items-center rounded-md border border-(--border) p-1">
      {Children.map(children, (child) =>
        isValidElement<{ value: string; selected?: boolean; name?: string; onSelect?: (v: string) => void }>(child)
          ? cloneElement(child, {
              selected: child.props.value === value,
              name,
              onSelect: onChange,
            })
          : child
      )}
    </div>
  );
}

export interface SegmentProps {
  value: string;
  children: ReactNode;
  name?: string;
  selected?: boolean;
  onSelect?: (value: string) => void;
}

export function Segment({ value, children, name, selected = false, onSelect }: SegmentProps) {
  const styling_label = `
    flex-1 cursor-pointer rounded-sm px-4 
    py-1.5 text-center text-sm font-medium 
    transition-colors 
    ${selected ? "bg-(--primary) text-white" : "text-(--primary) hover:bg-(--primary)/10"}
  `;

  return (
    <label className={styling_label}>
      <input
        className="sr-only"
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onSelect?.(value)}
      />
      {children}
    </label>
  );
}
