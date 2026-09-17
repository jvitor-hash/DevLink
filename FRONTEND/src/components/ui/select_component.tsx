import type { ReactEventHandler } from "react"

type SelectComponentProps = {
  labels: Record<string, string | number>
  name: string
  defaultValue?: string
  onChange?: ReactEventHandler<HTMLSelectElement>
  className?: string
}

export default function Select({ labels, name, defaultValue, onChange, className }: SelectComponentProps) {
  return (
    <select onChange={onChange} name={name} defaultValue={defaultValue} className={`border border-(--border-subtle) py-2 px-4 rounded-sm ${className}`}>
      {Object.entries(labels).map(([k, v]) => (
        <option key={k} value={v}>
          {k}
        </option>
      ))}
    </select>
  )
}
