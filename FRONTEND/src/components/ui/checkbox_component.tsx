import { useState } from 'react';

type checkboxComponentProps = {
  label: string
  checked?: boolean
  onToggle?: (checked: boolean) => void
}

export default function Checkbox({ label, checked, onToggle }: checkboxComponentProps) {
  const [internalChecked, setChecked] = useState<boolean>(checked ?? false);
  const isControlled = onToggle !== undefined;
  const isChecked = isControlled ? (checked ?? false) : internalChecked;

  return (
    <>
      <input
        type="checkbox"
        className="checkbox-input
          appearance-none m-0 w-5 h-5 inline-grid place-content-center
          bg-transparent border border-(--border-subtle) rounded
          hover:cursor-pointer checked:bg-(--primary) checked:border-(--primary)
          before:content-['✓'] before:text-white before:text-sm before:font-bold
          before:scale-0 checked:before:scale-100 checked:transition-all
        "
        checked={isChecked}
        onChange={(e) => {
          if (!isControlled) setChecked(e.target.checked);
          onToggle?.(e.target.checked);
        }}
      />
      <span> {label}</span>
    </>
  )
}
