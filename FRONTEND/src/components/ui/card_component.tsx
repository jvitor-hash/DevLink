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
      onClick={onClick}
      className={`p-5 border border-(--border-subtle) transition-all hover:shadow-lg ${clickable ? "cursor-pointer hover:-translate-y-1" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
