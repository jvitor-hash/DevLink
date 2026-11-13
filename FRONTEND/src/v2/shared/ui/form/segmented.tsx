import { Children, cloneElement, isValidElement } from "react";
export function Segmented({ value, onChange, children, name = "segmented" }) {
    return (
        <div role="radiogroup" className="inline-flex w-full items-center rounded-md border border-(--border) p-1" >
            {Children.map(children, (child) =>
                isValidElement<{ value: string }>(child)
                    ? cloneElement(child, {
                        selected: child.props.value === value,
                        name,
                        onSelect: onChange,
                    } as never) : child
            )}
        </div>
    );
}
export function Segment({ value, children, name, selected = false, onSelect }) {
    const styling_label=`
        flex-1 cursor-pointer rounded-sm px-4 
        py-1.5 text-center text-sm font-medium 
        transition-colors 
        ${selected ? "bg-(--primary) text-white" : "text-(--primary) hover:bg-(--primary)/10"}
    `;

    return (
        <label className={styling_label}>
            <input className="sr-only" type="radio" name={name} value={value} checked={selected} onChange={() => onSelect?.(value)}/>
            {children}
        </label>
    );
}
