import { useToasts, toastStore, type ToastVariant } from "@/shared/utils/toast_store";

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-(--success) text-(--success)",
  error: "border-(--error) text-(--error)",
  info: "border-(--border) text-(--text-primary)",
};

export function Toaster() {
  const toasts = useToasts();

  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => toastStore.dismiss(toast.id)}
          className={`pointer-events-auto rounded-md border-l-4 bg-(--surface-1) px-4 py-3 text-left text-sm shadow-xl transition-all cursor-pointer ${VARIANT_STYLES[toast.variant]}`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}

export default Toaster;
