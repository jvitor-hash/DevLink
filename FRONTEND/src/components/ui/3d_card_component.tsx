import { useRef, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

interface Card3DProps {
  children: ReactNode
  onClick: () => void
  className?: string
  style?: CSSProperties
  maxRotation?: number
  perspective?: number
  scale?: number
  glare?: boolean
}

export function Card3D({ children, onClick, className = "", style, maxRotation = 12, perspective = 1000, scale = 1.03, glare = true }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [transform, setTransform] = useState(
    "rotateX(0deg) rotateY(0deg) scale(1)"
  );

  const [glareStyle, setGlareStyle] = useState<CSSProperties>({
    opacity: 0,
  });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * maxRotation;
    const rotateX = -((y - centerY) / centerY) * maxRotation;

    setTransform(
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
    );

    if (glare) {
      setGlareStyle({
        opacity: 0.18,
        background: `
          radial-gradient(
            circle at ${x}px ${y}px,
            rgba(255,255,255,0.1),
            rgba(255,255,255,0.1) 20%,
            transparent 50%
          )
        `,
      });
    }
  };

  const handleMouseLeave = () => {
    setTransform("rotateX(0deg) rotateY(0deg) scale(1)");

    setGlareStyle({
      opacity: 0,
    });
  };

  return (
    <div
      style={{
        perspective: `${perspective}px`,
        ...style,
      }}
      className={className}
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "relative",
          transform,
          transformStyle: "preserve-3d",
          transition: "transform 150ms ease-out",
          willChange: "transform",
          cursor: "pointer",
        }}
      >
        {children}

        {glare && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              borderRadius: "inherit",
              transition: "opacity 200ms ease",
              ...glareStyle,
            }}
          />
        )}
      </div>
    </div>
  );
}
