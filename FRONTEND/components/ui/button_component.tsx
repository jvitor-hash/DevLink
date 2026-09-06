"use client";

import { ReactEventHandler } from "react";

type ButtonProps = {
  label: string,
  buttonType?: "button" | "reset" | "submit"
  colorType?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  onClick?: ReactEventHandler<HTMLButtonElement>
}

export default function Button({ label, buttonType, colorType = "primary", onClick }: ButtonProps) {
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
      className="rounded-full hover:cursor-pointer px-8 py-2 text-white"
      style={{
        backgroundColor: colors[colorType],
      }}
      type={buttonType}
      onClick={onClick}
    >{label}</button>
  )
}
