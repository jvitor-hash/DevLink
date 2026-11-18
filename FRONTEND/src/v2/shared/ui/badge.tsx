import type { ReactNode } from "react";

export interface BadgeProps {
  children?: ReactNode;
  tone?: "primary" | "brand" | "secondary" | "default" | "error" | string;
  className?: string;
}

export function Badge({ children, tone = "default", className = "" }: BadgeProps) {
  let toneClass = "bg-(--surface-2) text-(--text-secondary) border border-(--border-subtle)";

  if (tone === "brand" || tone === "primary") {
    toneClass = "bg-(--primary)/15 text-(--primary) border border-(--primary)/30";
  } else if (tone === "secondary") {
    toneClass = "bg-(--info)/15 text-(--info) border border-(--info)/30";
  } else if (tone === "error") {
    toneClass = "bg-(--error)/15 text-(--error) border border-(--error)/30";
  }

  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${toneClass} ${className}`}>
      {children}
    </span>
  );
}
