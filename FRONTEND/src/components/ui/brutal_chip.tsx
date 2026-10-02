import type { MouseEvent, ReactNode } from "react";

type BrutalChipProps = {
  children: ReactNode;
  active?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  dataTestId?: string;
  ariaLabel?: string;
};

/**
 * Rectangular filter chip. Active is accent fill with white text, inactive is
 * the frosted fallback fill with ink text.
 */
export function BrutalChip({ children, active = false, onClick, className = "", dataTestId, ariaLabel }: BrutalChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`gb-chip ${active ? "gb-chip-active" : "gb-chip-inactive"} ${className}`}
    >
      {children}
    </button>
  );
}