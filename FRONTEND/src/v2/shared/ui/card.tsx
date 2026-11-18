import type { ReactNode, CSSProperties, MouseEventHandler } from "react";

export interface CardProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function Card({ children, style, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`border border-(--border-subtle) bg-(--surface-1) p-4 rounded-md transition-shadow hover:shadow-md ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function Card3D({ children, onClick, className = "" }: CardProps) {
  return (
    <div onClick={onClick} className={`[perspective:1000px] ${className}`}>
      <div className="transition-transform duration-150 hover:[transform:rotateX(2deg)_rotateY(-2deg)_scale(1.02)]">
        {children}
      </div>
    </div>
  );
}
