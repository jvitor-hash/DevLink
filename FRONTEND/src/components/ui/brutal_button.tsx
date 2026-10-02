import type { CSSProperties, ReactNode } from "react";

type BrutalButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  variant?: "solid" | "ghost";
  dataTestId?: string;
};

/**
 * Solid accent button with a hard offset shadow that collapses on press.
 * `ghost` renders the frosted fallback fill with ink text.
 */
export function BrutalButton({ children, onClick, className = "", style, disabled, variant = "solid", dataTestId }: BrutalButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
      data-testid={dataTestId}
      className={`gb-button ${variant === "ghost" ? "gb-button-ghost" : ""} ${className}`}
    >
      {children}
    </button>
  );
}