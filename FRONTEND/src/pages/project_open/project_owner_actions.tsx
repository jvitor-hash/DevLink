import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/button_component";
import StarRating from "@/components/ui/star_rating_component";
import TextArea from "@/components/ui/textarea_component";
import { reviewService } from "@/services/review_service";
import { projectService } from "@/services/project_service";
import { authService } from "@/services/auth_service";
import type { ProjectDTO, ReviewDTO } from "@/lib/types/database";

type ProjectOwnerActionsProps = {
  project: ProjectDTO;
  onProjectUpdated: (project: ProjectDTO) => void;
};

/**
 * Owner-only controls ported from the old project modal: conclude an
 * in-development project and review the programmer once it is completed.
 */
export default function ProjectOwnerActions({ project, onProjectUpdated }: ProjectOwnerActionsProps) {
  const currentUserId = authService.getCachedUser()?.id;
  const isOwner = currentUserId === project.clientId;
  const canConclude = isOwner && project.status === "IN_DEVELOPMENT" && Boolean(project.programmerId);

  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewDescription, setReviewDescription] = useState<string>("");
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [isConcluding, setIsConcluding] = useState<boolean>(false);

  // Reviews only matter once the owner can review (project completed).
  useEffect(() => {
    if (!(isOwner && project.status === "COMPLETED")) return;

    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const projectReviews = await reviewService.list({ limit: 100 });

        if (cancelled) return;

        setReviews(
          Array.isArray(projectReviews)
            ? projectReviews.filter((review) => review.projectId === project.id).slice(0, 5)
            : [],
        );
      } catch {
        // Keep the current list on failure.
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [isOwner, project.status, project.id]);

  const refreshReviews = useCallback(async (): Promise<void> => {
    try {
      const projectReviews = await reviewService.list({ limit: 100 });

      setReviews(
        Array.isArray(projectReviews)
          ? projectReviews.filter((review) => review.projectId === project.id).slice(0, 5)
          : [],
      );
    } catch {
      // Keep the current list on failure.
    }
  }, [project.id]);

  const canReview = Boolean(
    isOwner
    && project.status === "COMPLETED"
    && project.programmerId
    && !reviews.some((review) => review.reviewerId === currentUserId),
  );
  const showReview = showReviewForm || canReview;

  const concludeProject = async (): Promise<void> => {
    setIsConcluding(true);

    try {
      const updated = await projectService.update(project.id, { status: "COMPLETED" });

      onProjectUpdated(updated);
      setShowReviewForm(true);
    } catch (concludeError) {
      setReviewStatus(concludeError instanceof Error ? concludeError.message : "Nao foi possivel concluir o projeto.");
    } finally {
      setIsConcluding(false);
    }
  };

  const submitReview = async (): Promise<void> => {
    if (!project.programmerId) return;

    if (reviewRating < 1) {
      setReviewStatus("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    if (!reviewDescription.trim()) {
      setReviewStatus("Escreva uma breve descricao.");
      return;
    }

    try {
      await reviewService.create({
        projectId: project.id,
        reviewedUserId: project.programmerId,
        title: `Avaliacao: ${project.title}`.slice(0, 150),
        description: reviewDescription.trim(),
        rating: reviewRating,
      });

      setReviewStatus("Avaliacao enviada. Obrigado!");
      setShowReviewForm(false);
      await refreshReviews();
    } catch (reviewError) {
      setReviewStatus(reviewError instanceof Error ? reviewError.message : "Nao foi possivel enviar a avaliacao.");
    }
  };

  if (!isOwner) return null;

  return (
    <div className="mt-6 border-t border-(--border-subtle) pt-4">
      {/* Conclude flow */}
      {canConclude && !showReviewForm && (
        <div className="mb-4">
          <Button
            label={isConcluding ? "Concluindo..." : "Marcar como concluido"}
            buttonType="button"
            colorType="success"
            onClick={concludeProject}
            disabled={isConcluding}
          />
        </div>
      )}

      {/* Review flow */}
      {showReview && (
        <div>
          <p className="mb-2 font-semibold text-(--text-primary)">Avalie o programador</p>

          <StarRating value={reviewRating} onChange={setReviewRating} />

          <div className="mt-3">
            <TextArea
              name="reviewDescription"
              label="Descreva brevemente sua experiencia"
              value={reviewDescription}
              onChange={(e) => setReviewDescription(e.target.value)}
              placeholder="Ex: entrega no prazo, boa comunicacao..."
            />
          </div>

          <div className="mt-3">
            <Button label="Enviar avaliacao" buttonType="button" colorType="primary" onClick={submitReview} />
          </div>
        </div>
      )}

      {reviewStatus && <p className="mt-2 text-sm text-(--info)">{reviewStatus}</p>}
    </div>
  );
}
