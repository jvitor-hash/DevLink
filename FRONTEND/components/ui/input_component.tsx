"use client";

type inputComponentProps = {
  inputType?: "text" | "email" | "password" | "number" | "range" | "tel" | "date" | "datetime-local" | "color"
  label: string
  name?: string
  value?: string | number
  placeholder?: string
}

import { useState } from "react";
import { Eye, EyeOff } from "react-feather";

export default function Input({ inputType, label, name, value, placeholder }: inputComponentProps) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = inputType === "password";

  return (
    <div className="flex flex-col gap-2">
      <p className="block w-full">{label}</p>

      <div className="relative">
        <input
          className="w-full rounded-md border border-(--border-subtle) not-valid:border-(--primary) text-white p-3 pr-10 placeholder:text-(--text-muted)"
          name={name ?? label.toLowerCase()}
          type={isPassword && showPassword ? "text" : inputType}
          placeholder={placeholder}
          value={value}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}
