import { useEffect, useRef, useState, type ReactNode } from "react";

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
}

export function Tooltip({ children, content }: TooltipProps) {
  const styling_tooltip_open = `
    absolute bottom-full left-1/2 z-50 mb-2 
    -translate-x-1/2 whitespace-nowrap rounded-md 
    border border-(--border-subtle) bg-(--surface-3) 
    px-2.5 py-1 text-xs text-(--text-primary) shadow-lg
  `;

  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const show = () => {
    timer.current = setTimeout(() => setOpen(true), 200);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span tabIndex={0} aria-describedby={open ? "tooltip" : undefined}>
        {children}
      </span>
      {open && (
        <span id="tooltip" role="tooltip" className={styling_tooltip_open}>
          {content}
        </span>
      )}
    </span>
  );
}
