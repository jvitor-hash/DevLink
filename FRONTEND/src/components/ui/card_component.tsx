import type { CSSProperties, ReactNode } from "react";

import { GlassFrame } from "@/components/ui/glass_frame";

type CardProps = {
  children: ReactNode,
  onClick?: () => void,
  className?: string,
  style?: CSSProperties,
}

export default function Card({ children, onClick, className = "", style }: CardProps) {
  const clickable = onClick !== undefined;

  return (
    <GlassFrame
      as="div"
      onClick={onClick}
      className={className}
      style={style}
      panelClassName={`p-5 border border-(--border-subtle) transition-all hover:shadow-lg ${clickable ? "hover:cursor-pointer hover:-translate-y-1" : ""}`}
    >
      {children}
    </GlassFrame>
  );
}