import { useState } from "react";
import { Eye, EyeOff } from "react-feather";

export function Field({ children, className = "" }) {
  return <div className={`flex flex-col gap-1.5 ${className}`}>{children}</div>;
}

export function Label({ htmlFor, children, required = false, className = ""}) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm text-(--text-secondary) ${className}`}>
      {children}
      {required && <span className="ml-1 text-(--error)">*</span>}
    </label>
  );
}

export function Input({ error, className = "", ...props }) {
  const styling_input = `
    w-full border bg-transparent p-2.5 text-sm 
    text-(--text-primary) outline-none transition-colors 
    placeholder:text-(--text-muted) hover:border-gray-400 
    focus:border-(--primary) 
    ${error ? "border-(--error)" : "border-(--border-subtle)"}
    ${className}
  `;

  return (
    <input {...props} aria-invalid={error ? true : props["aria-invalid"]} className={styling_input} />
  );
}

export function InputGroup({ children, className = "" }) {
  return <div className={`relative ${className}`}>{children}</div>;
}

export function InputAdornment({ children, side = "left" }) {
  return (
    <span
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-(--text-muted) ${side === "left" ? "left-3" : "right-3"}`}
    >
      {children}
    </span>
  );
}

export function PasswordToggle({ visible, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-white cursor-pointer"
      aria-label={visible ? "Esconder senha" : "Ver senha"}
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup>
      <Input {...props} type={visible ? "text" : "password"} className={`pr-10 ${props.className ?? ""}`} />
      <PasswordToggle visible={visible} onToggle={() => setVisible((current) => !current)} />
    </InputGroup>
  );
}
