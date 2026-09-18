import { useState } from "react";

type TextAreaComponentProps = {
  name: string
  value?: string
  label?: string
  dataTestId?: string
  placeholder?: string
  validInput?: boolean
  disabled?: boolean
  error?: boolean
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
};

export default function TextArea({
  name,
  value,
  label,
  dataTestId,
  placeholder,
  validInput,
  disabled,
  error,
  onChange,
}: TextAreaComponentProps) {
  const [isFocused, setFocused] = useState<boolean>(false);
  return (
    <>
      <div>
        <label htmlFor={name} className="block w-full mb-2">{validInput ? <span className="text-(--primary) px-1">*</span> : ""}{error ? <span className="text-(--error) px-1">*</span> : ""}{label}</label>
        <textarea
          className={`
            border placeholder:text-(--text-muted)
            ${isFocused === false ? "hover:border-gray-400" : ""} ${error ? "border-(--error)" : validInput ? "border-(--primary)" : isFocused ? "border-gray-400" : "border-(--border-subtle)"}
            resize-none p-2 rounded-sm animate-slide-down transition-colors w-full outline-none
          `}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={validInput}
          aria-invalid={error || undefined}
          data-testid={dataTestId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        ></textarea>
      </div>
    </>
  );
}
