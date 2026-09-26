import { useState } from 'react';

type checkboxComponentProps = {
  label: string
  checked?: boolean
  error?: boolean
  onToggle?: (checked: boolean) => void
}

export default function Checkbox({ label, checked, error, onToggle }: checkboxComponentProps) {
  const [internalChecked, setChecked] = useState<boolean>(checked ?? false);
  const isControlled = onToggle !== undefined;
  const isChecked = isControlled ? (checked ?? false) : internalChecked;

  return (
    <>
      <div>

        <input
          type="checkbox"
          className={`checkbox-input
          appearance-none m-0 w-5 h-5 inline-grid place-content-center
          bg-transparent border rounded
          hover:cursor-pointer checked:bg-(--primary) checked:border-(--primary)
          before:content-['✓'] before:text-white before:text-sm before:font-bold
          before:scale-0 checked:before:scale-100 checked:transition-all
          ${error && !isChecked ? "border-(--error)" : "border-(--border-subtle)"}
        `}
          checked={isChecked}
          aria-invalid={error && !isChecked ? true : undefined}
          onChange={(e) => {
            if (!isControlled) setChecked(e.target.checked);
            onToggle?.(e.target.checked);
          }}
        />
        <span> {label}</span>
      </div>
    </>
  )
}
