export function Select({ error, children, ...props }) {
    const styling_select=`
        rounded-sm border bg-(--surface-1) px-4 
        py-2 text-(--text-primary) outline-none 
        ${error ? "border-(--error)" : "border-(--border-subtle)"}
    `;

    return (
        <select {...props} aria-invalid={error || props["aria-invalid"] || undefined} className={styling_select}>
            {children}
        </select>
    );
};

export function SelectOption({ value, children }) {
    return <option value={value}>{children}</option>;
}
