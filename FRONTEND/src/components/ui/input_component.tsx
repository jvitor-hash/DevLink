import { useState } from "react";
import { Eye, EyeOff, Search, Lock, Mail } from "react-feather";
import type { Icon as IconType } from "react-feather";

const icons = {
  search: Search,
  mail: Mail,
  lock: Lock,
} as const;

export type IconName = keyof typeof icons;

type InputComponentProps = {
  icon?: IconName | IconType
  inputType?: "text" | "email" | "password" | "number" | "range" | "tel" | "date" | "datetime-local" | "color"
  label: string;
  name?: string;
  value?: string | number
  placeholder?: string
  className?: string
  dataTestId?: string
  error?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({ icon, inputType = "text", label, name, value, dataTestId, placeholder, error, onChange }: InputComponentProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isFocused, setFocus] = useState<boolean>(false);
  const isPassword = inputType === "password";

  const IconComponent =
    typeof icon === "string" ? icons[icon] : icon;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name ?? label.toLowerCase()} className="block w-full">
        {label}
      </label>

      <div className="relative animate-slide-down">
        {IconComponent && (
          <IconComponent
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--border-subtle)"
            size={18}
          />
        )}

        <input
          id={name ?? label.toLowerCase()}
          className={`outline-none w-full rounded-md border text-white p-3 invalid:border-(--primary) transition-colors
          ${error ? "border-(--error)" : isFocused ? "border-gray-400" : "border-(--border-subtle)"} ${isFocused === false && !error ? "hover:border-gray-400" : ""}
          ${ IconComponent ? "pl-10" : "pl-3" } ${isPassword ? "pr-10" : "pr-3"} placeholder:text-(--text-muted)`}
          name={name ?? label.toLowerCase()}
          type={isPassword && showPassword ? "text" : inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={error || undefined}
          data-testid={dataTestId}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
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
  );
}
