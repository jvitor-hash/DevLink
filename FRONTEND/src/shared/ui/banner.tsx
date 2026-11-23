import type { ReactNode } from "react";
import { X } from "react-feather";

export interface BannerProps {
  children?: ReactNode;
  tone?: "info" | "success" | "warning" | "error" | string;
  onDismiss?: () => void;
  className?: string;
}

export function Banner({ children, tone = "info", onDismiss, className = "" }: BannerProps) {
  const toneClass =
    tone === "success"
      ? "border-(--success) bg-(--success)/10 text-(--success)"
      : tone === "error"
      ? "border-(--error) bg-(--error)/10 text-(--error)"
      : tone === "warning"
      ? "border-(--warning) bg-(--warning)/10 text-(--warning)"
      : "border-(--info) bg-(--info)/10 text-(--info)";

  return (
    <div
      role="status"
      className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-sm ${toneClass} ${className}`}
    >
      <span className="flex-1 text-(--text-primary)">{children}</span>
      {onDismiss && (
        <button
          type="button"
          aria-label="Fechar"
          onClick={onDismiss}
          className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
