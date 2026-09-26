import { useState } from "react";

type MoneyInputProps = {
  label: string;
  name: string;
  value?: string;
  placeholder?: string;
  dataTestId?: string;
  error?: boolean;
  onChange?: (value: string) => void;
};

const formatCurrency = (value: string): string => {
  if (!value) return "";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return numeric.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Currency input based on the Input component: accepts digits only, formats
 * the value as BRL while focused and keeps the raw numeric string on change.
 */
export default function MoneyInput({ label, name, value, placeholder, dataTestId, error, onChange }: MoneyInputProps) {
  const [isFocused, setFocused] = useState<boolean>(false);
  const [internalValue, setInternalValue] = useState<string>(value ?? "");

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const digits = event.target.value.replace(/\D/g, "");

    if (!isControlled) setInternalValue(digits);
    onChange?.(digits);
  };

  const displayValue = isFocused ? currentValue : formatCurrency(currentValue);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="block w-full">
        {label}
      </label>

      <div className="relative animate-slide-down">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)">R$</span>

        <input
          id={name}
          name={name}
          className={`outline-none w-full rounded-md border text-white p-3 pl-10 pr-3 placeholder:text-(--text-muted) ${error ? "border-(--error)" : "border-(--border-subtle)"}`}
          inputMode="numeric"
          placeholder={placeholder}
          value={displayValue}
          aria-invalid={error || undefined}
          data-testid={dataTestId}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  );
}
