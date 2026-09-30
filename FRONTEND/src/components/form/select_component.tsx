import type { ChangeEvent } from "react"

type SelectComponentProps = {
  labels: Record<string, string | number>
  name: string
  value?: string
  defaultValue?: string
  placeholder?: string
  onChange?: (e: ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => void
  className?: string
  error?: boolean
  dataTestId?: string
}

export default function Select({ labels, name, value, defaultValue, placeholder, onChange, className, error, dataTestId }: SelectComponentProps) {
  const isControlled = value !== undefined;

  return (
    <select
      onChange={onChange}
      name={name}
      {...(isControlled ? { value } : { defaultValue })}
      aria-invalid={error || undefined}
      className={`border py-2 px-4 rounded-sm ${error ? "border-(--error)" : "border-(--border-subtle)"} ${className}`}
      data-testid={dataTestId}
    >
      {placeholder !== undefined && (
        <option value="" disabled className="bg-(--surface-1) text-(--text-primary)">
          {placeholder}
        </option>
      )}
      {Object.entries(labels).map(([k, v]) => (
        <option key={k} value={v} className="bg-(--surface-1) text-(--text-primary)">
          {k}
        </option>
      ))}
    </select>
  )
}
