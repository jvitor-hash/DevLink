import { Children, cloneElement, isValidElement } from "react";

export function Steps({ current, children }) {
    const items = Children.toArray(children);
    return (
        <nav aria-label="Progress" className="flex w-full">
            {items.map((child, index) =>
                isValidElement(child)
                    ? cloneElement(child, { current, last: index === items.length - 1 } as never) : null
            )}
        </nav>
    );
}
Steps.Item = function Item({ step, current, last = false, children }) {
    const complete = current !== undefined && step < current;

    const styling_div=`
        relative flex flex-1 items-start 
        ${!last ? "after:absolute after:left-1/2 after:right-[-50%] after:top-5 after:h-0.5" : ""} 
        ${complete ? "after:bg-(--primary)" : "after:bg-(--surface-2)"}
    `;

    return (
        <div className={styling_div}>
            <div className="relative z-10 flex w-full flex-col items-center">
                {Children.map(children, (child) =>
                    isValidElement(child)
                        ? cloneElement(child, { step, complete, active: step === current } as never) : null
                )}
            </div>
        </div>
    );
}

Steps.Indicator = function Indicator({ step, complete = false, active = false }) {
    const styling_span=`
        flex h-10 w-10 items-center justify-center 
        rounded text-sm 
        ${complete ? "bg-(--primary) text-white" : active ? "bg-white text-(--primary)": "bg-white text-gray-500"}
    `;
    
    return (
        <span className={styling_span}>
            {complete ? "✓" : step}
        </span>
    );
}
