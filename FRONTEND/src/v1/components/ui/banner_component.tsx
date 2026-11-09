import { useEffect, useRef, useState } from "react";
import { X } from "react-feather";

type BannerVariant = "success" | "error" | "info" | "warning";

/** Auto-dismiss duration per variant; variants omitted fall back to `defaultDuration`. */
type VariantDurations = Partial<Record<BannerVariant, number>>;

type BannerComponentProps = {
  variant?: BannerVariant;
  message: string;
  /** Overrides the resolved per-variant duration with an explicit value. */
  duration?: number;
  /** Duration (ms) used for variants not present in `variantDurations`. */
  defaultDuration?: number;
  /** Auto-dismiss duration (ms) per variant, e.g. `{ success: 2000 }`. */
  variantDurations?: VariantDurations;
  /** Called after the fade-out finishes; use it to clear upstream state. */
  onDismiss?: () => void;
  /** Positioning and sizing classes; defaults to a full-width overlay pinned to the top. */
  className?: string;
};

const variantStyles: Record<BannerVariant, string> = {
  success: "border-(--success) bg-(--success)/50 text-(--success)",
  error: "border-(--error) bg-(--error)/50 text-(--error)",
  info: "border-(--info) bg-(--info)/50 text-(--info)",
  warning: "border-(--warning) bg-(--warning)/50 text-(--warning)",
};

/**
 * Inline feedback banner that stays visible for its resolved duration, fades
 * out and then reports dismissal. The duration resolves per variant via
 * `variantDurations`, falling back to `defaultDuration` (default 5000ms); an
 * explicit `duration` prop always wins. Can also be dismissed early with the
 * close button. Re-show it by remounting with a new `key`
 * (e.g. an incrementing counter), which restarts visibility and timers.
 */
export default function Banner({
  variant = "info",
  message,
  duration,
  defaultDuration = 5000,
  variantDurations = {},
  onDismiss,
  className = "absolute inset-x-0 top-0",
}: BannerComponentProps) {
  const resolvedDuration = duration ?? variantDurations[variant] ?? defaultDuration;

  const [visible, setVisible] = useState<boolean>(true);

  // Latest callback without re-arming the timers on every parent render.
  const onDismissRef = useRef(onDismiss);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), resolvedDuration);
    const dismissTimer = setTimeout(() => onDismissRef.current?.(), resolvedDuration + 300);
    timersRef.current = [fadeTimer, dismissTimer];

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [resolvedDuration]);

  /** Dismiss early: cancel the auto timers, fade out, then report dismissal. */
  const handleDismiss = () => {
    timersRef.current.forEach(clearTimeout);
    setVisible(false);
    setTimeout(() => onDismissRef.current?.(), 300);
  };

  // Animation without fill-mode so the fade-out opacity transition still applies.
  return (
    <div
      role="status"
      data-testid={`banner-${variant}`}
      className={`
        z-50 flex items-center gap-2 rounded-sm border px-4 py-3 text-sm shadow-md transition-opacity duration-300
        animate-[slideDown_0.3s_ease-out]
        ${visible ? "opacity-100" : "opacity-0"}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        data-testid="banner-dismiss"
        className="shrink-0 cursor-pointer rounded-sm p-0.5 opacity-70 transition-opacity hover:opacity-100"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
