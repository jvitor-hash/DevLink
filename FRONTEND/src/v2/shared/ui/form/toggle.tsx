export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked = false, onChange, disabled = false }: ToggleProps) {
  const styling_button = `
    relative inline-flex h-5 w-9 shrink-0 
    items-center rounded-full border border-(--border) 
    bg-(--surface-2) transition-colors 
    disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer
    ${checked ? "bg-(--primary)" : "bg-(--surface-2)"}
  `;

  const styling_span = `
    pointer-events-none block h-3.5 w-3.5 rounded-full 
    bg-white shadow-sm transition-transform 
    ${checked ? "translate-x-4" : "translate-x-0.5"}
  `;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={styling_button}
    >
      <span className={styling_span} />
    </button>
  );
}
