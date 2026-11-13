export function Badge({ children, tone = "primary" }) { 
    const styling_span = `rounded-sm px-2 py-1 text-sm text-white ${tone === "bg-(--secondary)" ? "bg-(--surface-2)" : tone}`;
    return (
        <span className={styling_span}>
            {children}
        </span>
    ); 
}
