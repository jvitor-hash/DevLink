"use client";

import { ReactEventHandler } from "react";

type ButtonProps = {
  label: string,
  buttonType?: "button" | "reset" | "submit"
  colorType?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  onClick?: ReactEventHandler<HTMLButtonElement>
  className?: string
}

export default function Button({ label, buttonType, colorType = "primary", onClick, className }: ButtonProps) {
  const colors = {
    "primary": "var(--primary)",
    "secondary": "var(--secondary)",
    "success": "var(--success)",
    "warning": "var(--warning)",
    "error": "var(--error)",
    "info": "var(--info)"
  }

  return (
    <button
      className={`rounded-full hover:cursor-pointer px-8 py-2 text-white ${className}`}
      style={{
        backgroundColor: colors[colorType],
      }}
      type={buttonType}
      onClick={onClick}
    >{label}</button>
  )
}
