import type { CSSProperties, ReactNode } from "react";

type CardProps = {
  children: ReactNode,
  onClick?: () => void,
  className?: string,
  style?: CSSProperties,
}

export default function Card({ children, onClick, className = "", style }: CardProps) {
  const clickable = onClick !== undefined;

  return (
    <div
      className={`rounded-xl border border-(--border-subtle) bg-(--surface-1) p-5 transition-all hover:shadow-lg ${clickable ? "hover:cursor-pointer hover:-translate-y-1" : ""} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
