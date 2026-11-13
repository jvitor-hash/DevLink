export function Button({ tone = "primary", children, ...props }) { 
    const styling_button=`
        inline-flex cursor-pointer items-center 
        justify-center rounded-sm px-8 py-2 
        text-white disabled:cursor-not-allowed 
        disabled:opacity-50 
        ${tone === "primary" ? "bg-(--primary)" : tone === "secondary" ? "bg-(--secondary)" : "bg-(--error)"}
    `;

    return (
        <button {...props} className={styling_button}>
        {children}
        </button>
    ); 
};

export function IconButton({ label, children, ...props }) { 
    const styling_button="inline-flex cursor-pointer items-center justify-center rounded p-2 hover:bg-(--surface-3)";
    return (
        <button {...props} type={props.type ?? "button"} aria-label={label} className={styling_button}>
            {children}
        </button>
    ); 
}
