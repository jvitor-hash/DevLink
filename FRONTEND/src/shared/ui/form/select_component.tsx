import type { SelectHTMLAttributes, OptionHTMLAttributes, ReactNode } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string | boolean | null;
  children?: ReactNode;
}

export function Select({ error, children, className = "", ...props }: SelectProps) {
  const styling_select = `
    w-full border bg-(--surface-1) px-3 
    py-2 text-sm text-(--text-primary) outline-none transition-colors 
    ${error ? "border-(--error)" : "border-(--border-subtle)"}
    ${className}
  `;

  return (
    <select {...props} aria-invalid={error ? true : props["aria-invalid"]} className={styling_select}>
      {children}
    </select>
  );
}

export interface SelectOptionProps extends OptionHTMLAttributes<HTMLOptionElement> {
  value?: string | number | readonly string[];
  children?: ReactNode;
}

export function SelectOption({ value, children, ...props }: SelectOptionProps) {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  );
}
