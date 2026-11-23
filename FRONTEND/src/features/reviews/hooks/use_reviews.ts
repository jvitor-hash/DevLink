import { useState, useEffect, useCallback } from "react";
import { reviewService, type ReceivedReviewDTO } from "../service/review_service";
import type { ReviewCreate } from "@/shared/types/database";
import { toast } from "@/shared/utils/toast_store";

export function useReviews(userId?: string) {
  const [reviews, setReviews] = useState<ReceivedReviewDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const result = await reviewService.listReviewsByUser(userId);
    if (result.success && result.data) {
      setReviews(result.data);
    } else {
      setError(result.errors?.message || "Falha ao carregar avaliações.");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const addReview = useCallback(
    async (data: ReviewCreate) => {
      const result = await reviewService.createReview(data);
      if (result.success && result.data) {
        toast.success("Avaliação enviada com sucesso!");
        fetchReviews();
        return result.data;
      } else {
        toast.error("Erro ao enviar avaliação.");
        return null;
      }
    },
    [fetchReviews]
  );

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.review.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    averageRating,
    loading,
    error,
    addReview,
    refetch: fetchReviews,
  };
}
