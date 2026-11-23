import { useState, type ReactNode, type InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "children"> {
  children?: ReactNode;
}

export function Checkbox({ children, checked, defaultChecked, onChange, className = "", ...props }: CheckboxProps) {
  const styling_input = `
    m-0 h-4 w-4 appearance-none rounded border 
    border-(--border-subtle) bg-transparent 
    checked:border-(--primary) checked:bg-(--primary) 
    checked:before:content-['✓'] checked:before:text-white
    ${className}
  `;

  const [internal, setInternal] = useState(defaultChecked ?? false);
  const isChecked = checked ?? internal;

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-(--text-primary)">
      <input
        {...props}
        type="checkbox"
        checked={isChecked}
        onChange={(event) => {
          if (checked === undefined) setInternal(event.target.checked);
          onChange?.(event);
        }}
        className={styling_input}
      />
      {children}
    </label>
  );
}
