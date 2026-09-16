import { useState } from "react";
import { Star } from "react-feather";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
};

/**
 * Interactive 0-5 star rating. Without onChange it renders read-only.
 */
export default function StarRating({ value, onChange, disabled = false }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const isInteractive = typeof onChange === "function" && !disabled;
  const visible = hovered ?? value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Avaliacao">
      {[0, 1, 2, 3, 4].map((index) => (
        <button
          key={index}
          type="button"
          role="radio"
          aria-checked={value === index + 1}
          disabled={!isInteractive}
          className={`${isInteractive ? "hover:cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          onMouseEnter={() => isInteractive && setHovered(index + 1)}
          onMouseLeave={() => isInteractive && setHovered(null)}
          onClick={() => isInteractive && onChange(index + 1)}
        >
          <Star
            size={26}
            className={index < visible ? "fill-(--warning) text-(--warning)" : "text-(--border-subtle)"}
          />
        </button>
      ))}
    </div>
  );
}
