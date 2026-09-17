import type { ReactEventHandler } from "react";
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

export default function Button({ label, buttonType = "button", colorType = "primary", onClick, className = "", href, dataTestId, disabled }: ButtonProps) {
  const buttonClassName = `inline-flex items-center justify-center rounded-full hover:cursor-pointer px-8 py-2 text-white ${className}`;
  const style = { backgroundColor: `color-mix(in srgb, ${colors[colorType]} 80%, black)` };

  if (href !== undefined) {
    return <Link className={buttonClassName} style={style} to={href}>{label}</Link>;
  }

  return <button className={buttonClassName} disabled={disabled} style={style} type={buttonType} data-testid={dataTestId} onClick={onClick}>{label}</button>;
}
