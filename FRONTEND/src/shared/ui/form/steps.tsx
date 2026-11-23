import { Children, cloneElement, isValidElement, type ReactNode } from "react";

export interface StepsProps {
  current?: number;
  children?: ReactNode;
}

export function Steps({ current, children }: StepsProps) {
  const items = Children.toArray(children);
  return (
    <nav aria-label="Progresso" className="flex w-full">
      {items.map((child, index) =>
        isValidElement<{ current?: number; last?: boolean }>(child)
          ? cloneElement(child, { current, last: index === items.length - 1 })
          : null
      )}
    </nav>
  );
}

Steps.Item = function Item({
  step,
  current,
  last = false,
  children,
}: {
  step?: number;
  current?: number;
  last?: boolean;
  children?: ReactNode;
}) {
  const complete = current !== undefined && step !== undefined && step < current;

  const styling_div = `
    relative flex flex-1 items-start 
    ${!last ? "after:absolute after:left-1/2 after:right-[-50%] after:top-5 after:h-0.5" : ""} 
    ${complete ? "after:bg-(--primary)" : "after:bg-(--surface-2)"}
  `;

  return (
    <div className={styling_div}>
      <div className="relative z-10 flex w-full flex-col items-center">
        {Children.map(children, (child) =>
          isValidElement<{ step?: number; complete?: boolean; active?: boolean }>(child)
            ? cloneElement(child, { step, complete, active: step === current })
            : null
        )}
      </div>
    </div>
  );
};

Steps.Indicator = function Indicator({
  step,
  complete = false,
  active = false,
}: {
  step?: number;
  complete?: boolean;
  active?: boolean;
}) {
  const styling_span = `
    flex h-9 w-9 items-center justify-center 
    rounded text-sm font-semibold
    ${complete ? "bg-(--primary) text-white" : active ? "bg-(--primary)/20 text-(--primary) border border-(--primary)" : "bg-(--surface-2) text-(--text-muted)"}
  `;

  return <span className={styling_span}>{complete ? "✓" : step}</span>;
};
