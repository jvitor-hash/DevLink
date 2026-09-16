import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/ui/button_component";
import Badge from "@/components/ui/badge_component";
import TextArea from "@/components/ui/textarea_component";
import StarRating from "@/components/ui/star_rating_component";
import { projectService } from "@/services/project_service";
import { reviewService } from "@/services/review_service";
import { messageService } from "@/services/message_service";
import { authService } from "@/services/auth_service";
import type { ProjectDTO, ReviewDTO, MessageDTO } from "@/lib/types/database";

export function ProjectModal() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const params = new URLSearchParams(search);
  const modal = params.get("modal");
  const projectId = params.get("id");

  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewDescription, setReviewDescription] = useState<string>("");
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [isConcluding, setIsConcluding] = useState<boolean>(false);

  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      setError(null);
      setProject(null);
      setReviews([]);
      setMessages([]);

      if (!projectId) {
        setError("Projeto não encontrado.");
        setIsLoading(false);
        return;
      }

      try {
        const projectData = await projectService.getById(projectId);
        setProject(projectData);

        const projectReviews = await reviewService.list({ limit: 100 });
        const filteredReviews = Array.isArray(projectReviews)
          ? projectReviews.filter((r) => r.projectId === projectId).slice(0, 5)
          : [];
        setReviews(filteredReviews);

        const projectMessages = await messageService.list({ limit: 50 });
        const filteredMessages = Array.isArray(projectMessages)
          ? projectMessages.filter((m) => m.projectId === projectId).slice(0, 10)
          : [];
        setMessages(filteredMessages);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o projeto.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modal === "project" && !dialog.open) dialog.showModal();
    if (modal !== "project" && dialog.open) dialog.close();
  }, [modal]);

  function closeModal() {
    params.delete("modal");
    params.delete("id");
    const query = params.toString();
    navigate(query ? `${pathname}?${query}` : pathname);
  }

  const currentUserId = authService.getCachedUser()?.id;
  const isOwner = currentUserId === project?.clientId;
  const canConclude = isOwner && project?.status === "IN_DEVELOPMENT" && project?.programmerId;
  const canReview = Boolean(
    isOwner
    && project?.status === "COMPLETED"
    && project?.programmerId
    && !reviews.some((review) => review.reviewerId === currentUserId)
  );
  const showReview = showReviewForm || canReview;

  const refreshReviews = async (): Promise<void> => {
    if (!projectId) return;

    try {
      const projectReviews = await reviewService.list({ limit: 100 });
      const filteredReviews = Array.isArray(projectReviews)
        ? projectReviews.filter((r) => r.projectId === projectId).slice(0, 5)
        : [];
      setReviews(filteredReviews);
    } catch {
      // Keep the current list on failure.
    }
  };

  const concludeProject = async (): Promise<void> => {
    if (!project) return;

    setIsConcluding(true);
    try {
      const updated = await projectService.update(project.id, { status: "COMPLETED" });
      setProject(updated);
      setShowReviewForm(true);
    } catch (concludeError) {
      setError(concludeError instanceof Error ? concludeError.message : "Nao foi possivel concluir o projeto.");
    } finally {
      setIsConcluding(false);
    }
  };

  const submitReview = async (): Promise<void> => {
    if (!project?.programmerId || !project.id) return;
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
        reviewerId: authService.getCachedUser()?.id ?? "",
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

  if (!projectId) {
    return (
      <>
        <div onClick={closeModal} className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity ${modal === "project" ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
        <dialog ref={dialogRef} onCancel={closeModal} className="bg-(--surface-1) m-auto text-white rounded-md p-6 min-w-6xl">
          <h2 className="text-2xl">Projeto não encontrado</h2>
          <button onClick={closeModal}>Fechar</button>
        </dialog>
      </>
    );
  }

  return (
    <>
      <div onClick={closeModal} className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity ${modal === "project" ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <dialog ref={dialogRef} onCancel={closeModal} className="bg-(--surface-1) m-auto text-white rounded-md p-6 min-w-6xl">
        {error ? (
          <>
            <h2 className="text-2xl">Erro</h2>
            <p className="text-(--error)">{error}</p>
            <Button label="Fechar" buttonType="button" colorType="secondary" onClick={closeModal} />
          </>
        ) : isLoading ? (
          <p className="text-white">Carregando...</p>
        ) : project ? (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex gap-2 items-center">
                  <Badge label={project.category} badgeType="primary" />
                  <Badge label={project.status} badgeType={project.status === "OPEN" ? "success" : "info"} />
                </div>
                <h2 className="text-3xl font-bold text-white mt-2">{project.title}</h2>
              </div>
              <Button label="Fechar" buttonType="button" colorType="secondary" onClick={closeModal} />
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-(--text-secondary)">{project.description}</p>

              {project.problem && (
                <div className="mt-4 bg-(--surface-2) rounded-lg p-4 border border-(--border-subtle)">
                  <p className="font-semibold text-white mb-2">Problema</p>
                  <p className="text-(--text-secondary)">{project.problem}</p>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="border border-(--border-subtle) rounded-lg p-4 bg-(--surface-2)">
                  <p className="text-sm text-(--text-muted)">Plataforma</p>
                  <p className="text-white font-semibold">{project.platforms.join(", ")}</p>
                </div>
                <div className="border border-(--border-subtle) rounded-lg p-4 bg-(--surface-2)">
                  <p className="text-sm text-(--text-muted)">Linguagem</p>
                  <p className="text-white font-semibold">{project.primaryLanguage}</p>
                </div>
                <div className="border border-(--border-subtle) rounded-lg p-4 bg-(--surface-2)">
                  <p className="text-sm text-(--text-muted)">Prazo</p>
                  <p className="text-white font-semibold">
                    {project.deadline ? String(project.deadline).slice(0, 10) : "Não definido"}
                  </p>
                </div>
                <div className="border border-(--border-subtle) rounded-lg p-4 bg-(--surface-2)">
                  <p className="text-sm text-(--text-muted)">Orçamento</p>
                  <p className="text-white font-semibold">
                    R$ {project.minBudget} - {project.maxBudget}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-(--border-subtle) pt-4">
                <p className="font-semibold text-white mb-2">Status do projeto</p>
                <Badge label={project.status} badgeType={project.status === "OPEN" ? "success" : "info"} />

                {canConclude && !showReviewForm && (
                  <div className="mt-3">
                    <Button
                      label={isConcluding ? "Concluindo..." : "Marcar como concluido"}
                      buttonType="button"
                      colorType="success"
                      onClick={concludeProject}
                      disabled={isConcluding}
                    />
                  </div>
                )}
              </div>

              {showReview && (
                <div className="mt-6 border-t border-(--border-subtle) pt-4">
                  <p className="font-semibold text-white mb-2">Avalie o programador</p>
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
                  {reviewStatus && <p className="mt-2 text-sm text-(--info)">{reviewStatus}</p>}
                  <div className="mt-3">
                    <Button label="Enviar avaliacao" buttonType="button" colorType="primary" onClick={submitReview} />
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-(--border-subtle) pt-4">
                <p className="font-semibold text-white mb-2">Ações requeridas</p>
                <p className="text-(--text-secondary)">{project.user_actions ?? "Nenhuma ação definida."}</p>
              </div>

              {reviews.length ? (
                <div className="mt-6 border-t border-(--border-subtle) pt-4">
                  <p className="font-semibold text-white mb-2">Avaliações recentes</p>
                  <ul className="space-y-2">
                    {reviews.map((review) => (
                      <li key={review.id} className="border-b border-(--border-subtle) pb-2">
                        <p className="text-white">{review.title}</p>
                        <p className="text-sm text-(--text-muted)">{review.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {messages.length ? (
                <div className="mt-6 border-t border-(--border-subtle) pt-4">
                  <p className="font-semibold text-white mb-2">Mensagens</p>
                  <ul className="space-y-2">
                    {messages.map((message) => (
                      <li key={message.id} className="border-b border-(--border-subtle) pb-2">
                        <p className="text-white">{message.content}</p>
                        <p className="text-sm text-(--text-muted)">{message.senderId}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </dialog>
    </>
  );
}
