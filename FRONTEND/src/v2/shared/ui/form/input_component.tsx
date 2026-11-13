import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "react-feather";

export function Field({ children }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

export function Label({ htmlFor, children, required = false }) {
  return (
    <label htmlFor={htmlFor} className="block w-full">
      {required && <span className="px-1 text-(--primary)">*</span>}
      {children}
    </label>
  );
}

export function Input({ error, ...props }) {
    const styling_input = `
        w-full rounded-md border bg-transparent p-3 
        text-(--text-primary) outline-none transition-colors 
        placeholder:text-(--text-muted) hover:border-gray-400 
        focus:border-gray-400 
        ${error ? "border-(--error)" : "border-(--border-subtle)"}
    `;

    return (
        <input {...props} aria-invalid={error || props["aria-invalid"] || undefined} className={styling_input}/>
    );
}

export function InputGroup({ children }: { children: ReactNode; className?: string }) { return <div className="relative">{children}</div>; }

export function InputAdornment({ children, side = "left" }) {
    return (
        <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-(--text-muted) ${side === "left" ? "left-3" : "right-3"}`}>
            {children}
        </span>
    );
}

export function PasswordToggle({ visible, onToggle }) {
    return (
        <button type="button" onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-white"
            aria-label={visible ? "Hide password" : "Show password"}
        >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
    );
}

export function PasswordInput(props) {
    const [visible, setVisible] = useState(false);
    return (
        <InputGroup>
            <Input {...props} type={visible ? "text" : "password"} className="pr-10" />
            <PasswordToggle visible={visible} onToggle={() => setVisible((current) => !current)} />
        </InputGroup>
    );
}
