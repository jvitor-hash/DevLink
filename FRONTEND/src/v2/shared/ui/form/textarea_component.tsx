export function Textarea({ error, ...props }) {
    const styling_textarea=`
        w-full resize-none rounded-sm border bg-transparent 
        p-2 text-(--text-primary) outline-none transition-colors 
        placeholder:text-(--text-muted) hover:border-gray-400 focus:border-gray-400" 
        ${error ? "border-(--error)" : "border-(--border-subtle)"}
    `;

    return (
        <textarea {...props} aria-invalid={error || props["aria-invalid"] || undefined} className={styling_textarea}/>
    );
};
