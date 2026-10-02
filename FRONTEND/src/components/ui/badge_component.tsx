type BadgeComponentProps = {
  className?: string,
  badgeType?: "primary" | "secondary" | "success" | "warning" | "info" | "error",
  label: string,
}

export default function Badge({ className, badgeType = "primary", label }: BadgeComponentProps) {
  const colors: Record<string, string> = {
    "primary": "bg-(--primary)",
    "secondary": "bg-(--surface-2)",
    "success": "bg-(--success)",
    "warning": "bg-(--warning)",
    "info": "bg-(--info)",
    "error": "bg-(--error)"
  }
  return (
    <span className={`gb-tag ${colors[badgeType]} ${className}`}>
      {label}
    </span>
  )
}
