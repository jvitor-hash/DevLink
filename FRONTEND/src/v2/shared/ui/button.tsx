import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "primary" | "secondary" | "danger" | string;
  children?: ReactNode;
}

export function Button({ tone = "primary", children, onClick, className = "", ...props }: ButtonProps) {
  const toneClass =
    tone === "primary"
      ? "bg-(--primary) text-white hover:opacity-90"
      : tone === "secondary"
      ? "bg-(--surface-2) text-(--text-primary) border border-(--border) hover:bg-(--surface-3)"
      : "bg-(--error) text-white hover:opacity-90";

  return (
    <button
      {...props}
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center justify-center rounded-sm px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${toneClass} ${className}`}
    >
      {children}
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  children?: ReactNode;
}

export function IconButton({ label, children, onClick, className = "", ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center justify-center rounded p-2 hover:bg-(--surface-3) transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
