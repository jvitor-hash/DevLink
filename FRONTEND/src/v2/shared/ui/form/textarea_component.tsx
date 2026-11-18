import type { TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | boolean | null;
}

export function Textarea({ error, className = "", ...props }: TextareaProps) {
  const styling_textarea = `
    w-full resize-y rounded-md border bg-transparent 
    p-2.5 text-sm text-(--text-primary) outline-none transition-colors 
    placeholder:text-(--text-muted) hover:border-gray-400 focus:border-(--primary) 
    ${error ? "border-(--error)" : "border-(--border-subtle)"}
    ${className}
  `;

  return (
    <textarea {...props} aria-invalid={error ? true : props["aria-invalid"]} className={styling_textarea} />
  );
}
