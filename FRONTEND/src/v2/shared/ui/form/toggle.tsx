export function Toggle({ checked, onChange, disabled = false }) {
    const styling_button=`
        relative inline-flex h-6 w-11 shrink-0 
        items-center rounded-full border border-(--border) 
        bg-(--surface-2) transition-colors 
        disabled:cursor-not-allowed disabled:opacity-50
    `;

    const styling_span=`
        pointer-events-none block h-4 w-4 rounded-full 
        bg-white shadow-sm transition-transform 
        ${checked ? "translate-x-6" : "translate-x-1"}
    `;

    return (
        <button type="button" role="switch" aria-checked={checked} 
            disabled={disabled} 
            onClick={() => onChange(!checked)} 
            className={styling_button}
        >
            <span className={styling_span}/>
        </button>
    );
}
