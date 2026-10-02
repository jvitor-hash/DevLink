import { useToasts, toastStore, type ToastVariant } from "@/utils/toast_store";

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-(--success) text-(--success)",
  error: "border-(--error) text-(--error)",
  info: "border-(--text-muted) text-(--text-primary)",
};

// Renders the global toast stack; mount once in the app root.
export default function Toaster() {
  const toasts = useToasts();

  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-100 flex flex-col gap-2"
      role="status"
      aria-live="polite"
      data-testid="toaster"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => toastStore.dismiss(toast.id)}
          className={`rounded-md border-l-4 bg-(--surface-2) px-4 py-3 text-left text-sm shadow-lg transition-opacity hover:cursor-pointer ${VARIANT_STYLES[toast.variant]}`}
          data-testid={`toast-${toast.variant}`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
