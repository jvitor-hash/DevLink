import { useState } from "react";
import { Star } from "react-feather";

export interface RatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
}

export function Rating({ value = 0, onChange, disabled = false }: RatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = !!onChange && !disabled;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          disabled={!interactive}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange?.(star)}
          className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
        >
          <Star
            size={24}
            className={star <= (hovered ?? value) ? "fill-(--warning) text-(--warning)" : "text-(--border-subtle)"}
          />
        </button>
      ))}
    </div>
  );
}
