import type { ReceivedReviewDTO } from "../service/review_service";
import { Star } from "react-feather";

interface ReviewCardProps {
  item: ReceivedReviewDTO;
}

export function ReviewCard({ item }: ReviewCardProps) {
  const { review, reviewer, project } = item;

  return (
    <div className="p-4 border border-(--border-subtle) bg-(--surface-1) rounded-md flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-(--primary)/20 flex items-center justify-center font-bold text-xs text-(--primary)">
            {reviewer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-(--text-primary)">{reviewer.name}</h4>
            <span className="text-[11px] text-(--text-muted)">
              Projeto: {project.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-(--warning)">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              fill={i < review.rating ? "currentColor" : "none"}
              className={i < review.rating ? "text-amber-400" : "text-(--border)"}
            />
          ))}
        </div>
      </div>

      <div className="mt-1">
        <h5 className="font-medium text-sm text-(--text-primary)">{review.title}</h5>
        <p className="text-xs text-(--text-secondary) mt-0.5 leading-relaxed">
          {review.description}
        </p>
      </div>

      {review.createdAt && (
        <span className="text-[10px] text-(--text-muted) self-end mt-1">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}
