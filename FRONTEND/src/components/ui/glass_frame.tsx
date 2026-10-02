import type { CSSProperties, ReactNode } from "react";

type GlassFrameProps = {
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  style?: CSSProperties;
  onClick?: () => void;
  as?: "div" | "section" | "article" | "aside" | "nav";
};

/**
 * Frosted panel with a 2px ink border, sharp corners and a hard offset shadow.
 * The shadow is a sibling layer behind the panel so its solid ink never gets
 * blurred into the frosted fill.
 *
 * Only the `gb-*` classes are theme-scoped; when the theme is off they are
 * inert and the element renders as a plain wrapper. Padding lives in
 * `panelClassName` so the call site keeps control of it in both themes.
 */
export function GlassFrame({ children, className = "", panelClassName = "", style, onClick, as: Tag = "div" }: GlassFrameProps) {
  return (
    <Tag className={`gb-frame ${className}`} style={style} onClick={onClick}>
      <span aria-hidden="true" className="gb-frame-shadow" />

      <div className={`gb-glass relative ${panelClassName}`}>
        {children}
      </div>
    </Tag>
  );
}