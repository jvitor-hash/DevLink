import { ReviewCard } from "./review_card";
import type { ReceivedReviewDTO } from "../service/review_service";
import { Star } from "react-feather";

interface ReviewListProps {
  reviews: ReceivedReviewDTO[];
  averageRating?: number;
  loading?: boolean;
}

export function ReviewList({
  reviews,
  averageRating = 0,
  loading = false,
}: ReviewListProps) {
  if (loading) {
    return (
      <div className="p-6 text-center text-xs text-(--text-muted)">
        Carregando avaliações...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {reviews.length > 0 && (
        <div className="flex items-center gap-3 p-4 border border-(--border-subtle) bg-(--surface-2)/30 rounded-md">
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={20} fill="currentColor" />
            <span className="text-xl font-bold text-(--text-primary)">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-(--text-muted)">
            com base em {reviews.length} avaliação{reviews.length === 1 ? "" : "ões"}
          </span>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="p-8 text-center text-sm text-(--text-muted) italic border border-dashed border-(--border-subtle) rounded-md">
          Nenhuma avaliação recebida ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <ReviewCard key={r.review.id} item={r} />
          ))}
        </div>
      )}
    </div>
  );
}
