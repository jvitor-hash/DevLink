import { X } from "react-feather";

export function Banner({children, tone = "info", onDismiss}) {
  return (
    <div role="status" className={`flex items-center gap-2 rounded-sm border px-4 py-3 text-sm text-(--${tone})`}>
      <span className="flex-1">{children}</span>
      {onDismiss && (
        <button type="button" aria-label="Dismiss" onClick={onDismiss}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
