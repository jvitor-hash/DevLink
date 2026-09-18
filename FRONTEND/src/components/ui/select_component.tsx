import type { ChangeEvent } from "react"

type SelectComponentProps = {
  labels: Record<string, string | number>
  name: string
  /** Controlled value; when provided the select is fully controlled. */
  value?: string
  defaultValue?: string
  /** Placeholder option shown when the controlled value is empty. */
  placeholder?: string
  onChange?: (e: ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => void
  className?: string
  error?: boolean
}

export default function Select({ labels, name, value, defaultValue, placeholder, onChange, className, error }: SelectComponentProps) {
  const isControlled = value !== undefined;

  return (
    <select
      onChange={onChange}
      name={name}
      // Controlled when `value` is given; uncontrolled otherwise.
      {...(isControlled ? { value } : { defaultValue })}
      aria-invalid={error || undefined}
      className={`border py-2 px-4 rounded-sm ${error ? "border-(--error)" : "border-(--border-subtle)"} ${className}`}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {Object.entries(labels).map(([k, v]) => (
        <option key={k} value={v}>
          {k}
        </option>
      ))}
    </select>
  )
}
