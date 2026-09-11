import { useState } from "react";

type TextAreaComponentProps = {
  name: string;
  value?: string;
  label?: string;
  dataTestId?: string;
  placeholder?: string;
  disabled?: boolean;
};

export default function TextArea({
  name,
  value,
  label,
  dataTestId,
  placeholder,
  disabled,
}: TextAreaComponentProps) {
  const [isFocused, setFocused] = useState<boolean>(false);
  return (
    <>
      <div>
        <label htmlFor={name ?? label.toLowerCase()} className="block w-full">{label}</label>
        <textarea
          className={`
            border border-(--border-subtle) placeholder:text-(--text-muted)
            ${isFocused === false ? "hover:border-gray-400" : ""} ${isFocused ? "border-gray-400" : "border-(--border-subtle)"}
            resize-none p-2 rounded-sm animate-slide-down transition-colors w-full outline-none
          `}
          placeholder={placeholder}
          name={name ?? label.toLowerCase()}
          value={value}
          disabled={disabled}
          data-testId={dataTestId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        ></textarea>
      </div>
    </>
  );
}
