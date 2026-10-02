import type { CSSProperties, ReactEventHandler } from "react";
import { Link } from "react-router-dom";

type ButtonProps = {
  label: string,
  buttonType?: "button" | "reset" | "submit"
  colorType?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  onClick?: ReactEventHandler<HTMLButtonElement>
  className?: string
  href?: string
  disabled?: boolean
  dataTestId?: string
}

const colors = {
  "primary": "var(--primary)",
  "secondary": "var(--secondary)",
  "success": "var(--success)",
  "warning": "var(--warning)",
  "error": "var(--error)",
  "info": "var(--info)"
} as const;

// Secondary reads as the frosted ghost treatment; the rest stay solid accent.
const isGhost = (colorType: keyof typeof colors): boolean => colorType === "secondary";

// The fill goes through a custom property so the theme layer can override it
// without the inline style winning the cascade.
const fillStyle = (colorType: keyof typeof colors): CSSProperties => (
  isGhost(colorType) ? {} : { "--gb-button-fill": `color-mix(in srgb, ${colors[colorType]} 80%, black)` } as CSSProperties
);

export default function Button({ label, buttonType = "button", colorType = "primary", onClick, className = "", href, dataTestId, disabled }: ButtonProps) {
  const buttonClassName = `gb-button ${isGhost(colorType) ? "gb-button-ghost" : ""} ${className}`;
  const style = fillStyle(colorType);

  if (href !== undefined) {
    return <Link className={buttonClassName} style={style} to={href}>{label}</Link>;
  }

  return <button className={buttonClassName} disabled={disabled} style={style} type={buttonType} data-testid={dataTestId} onClick={onClick}>{label}</button>;
}