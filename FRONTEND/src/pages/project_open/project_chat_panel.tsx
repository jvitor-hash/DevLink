import { useEffect, useRef, useState } from "react";
import { Calendar, MessageCircle, Send, X } from "react-feather";
import { useParams } from "react-router-dom";
import Input from "@/components/ui/input_component";
import Button from "@/components/ui/button_component";
import { messageService } from "@/services/message_service";
import { projectService } from "@/services/project_service";
import { authService } from "@/services/auth_service";
import type { MessageDTO } from "@/lib/types/database";

const POLL_INTERVAL_MS = 5_000;

const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

type ProjectChatPanelProps = {
  open: boolean;
  onToggle: () => void;
};

/**
 * Self-contained floating chat dock anchored to the right edge of the
 * screen, independent of the project layout. Also handles deadline
 * negotiation offers (capped by the project's real deadline).
 */
export default function ProjectChatPanel({ open, onToggle }: ProjectChatPanelProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [offerMode, setOfferMode] = useState<boolean>(false);
  const [offerDate, setOfferDate] = useState<string>("");
  const [projectDeadline, setProjectDeadline] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentUserId = authService.getCachedUser()?.id;

  // Fetch thread on open and poll while the dock is visible.
  useEffect(() => {
    if (!open || !projectId) return;

    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const thread = await messageService.listByProject(projectId, { limit: 100 });

        if (cancelled) return;

        setMessages(thread);
        setHasLoaded(true);
        setError(null);
      } catch (loadError: unknown) {
        if (cancelled) return;

        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar as mensagens.");
      }
    };

    void load();

    const poll = setInterval(() => {
      void load();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [open, projectId]);

  // The offer cap needs the project's actual deadline.
  useEffect(() => {
    if (!open || !projectId || !currentUserId) return;

    let cancelled = false;

    projectService.getById(projectId)
      .then((project) => {
        if (cancelled) return;

        setProjectDeadline(project.deadline ? String(project.deadline).slice(0, 10) : null);
      })
      .catch(() => {
        if (!cancelled) setProjectDeadline(null);
      });

    return () => {
      cancelled = true;
    };
  }, [open, projectId, currentUserId]);

  // Keep the newest message in view while the dock is open.
  useEffect(() => {
    if (!open) return;

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  const handleSend = async (): Promise<void> => {
    const content = draft.trim();

    if (!content || !currentUserId || isSending) return;

    setIsSending(true);

    try {
      const sent = await messageService.create({
        projectId: projectId ?? "",
        senderId: currentUserId,
        content,
        offerDeadline: offerMode && offerDate ? new Date(`${offerDate}T12:00:00`).toISOString() : undefined,
      });

      setMessages((prev) => [...prev.filter((m) => m.id !== sent.id), sent]);
      setDraft("");
      setOfferMode(false);
      setOfferDate("");
      setError(null);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Não foi possível enviar a mensagem.");
    } finally {
      setIsSending(false);
    }
  };

  const handleResolveOffer = async (messageId: string, decision: "ACCEPTED" | "REJECTED"): Promise<void> => {
    setResolvingId(messageId);

    try {
      const updated = await messageService.resolveOffer(messageId, decision);
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setError(null);
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : "Não foi possível resolver a proposta.");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <>
      {/* Top-right chat toggle, independent of the page layout */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Fechar chat" : "Abrir chat"}
        data-testid="open-chat-btn"
        className="fixed right-4 top-20 z-40 rounded-full p-3 text-white shadow-lg transition-transform hover:cursor-pointer hover:scale-105"
        style={{ backgroundColor: "color-mix(in srgb, var(--primary) 80%, black)" }}
      >
        <MessageCircle size={20} aria-hidden="true" />
      </button>

      {/* Floating dock */}
      {open && (
        <aside
          data-testid="chat-dock"
          className="fixed bottom-0 right-0 top-16 z-40 flex w-full max-w-md flex-col border-l border-(--border-subtle) bg-(--surface-1) shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-(--border-subtle) p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-(--text-primary)">
              <MessageCircle size={18} aria-hidden="true" />
              Chat do projeto
            </h2>

            <button
              type="button"
              onClick={onToggle}
              aria-label="Fechar chat"
              data-testid="close-chat-btn"
              className="rounded-sm p-1 text-(--text-muted) transition-colors hover:bg-(--surface-2) hover:text-(--text-primary)"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!hasLoaded && !error ? (
              <p className="text-sm text-(--text-muted)">Carregando mensagens...</p>
            ) : error ? (
              <p className="text-sm text-(--error)">{error}</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-(--text-muted)">Nenhuma mensagem ainda. Inicie a conversa!</p>
            ) : (
              messages.map((message) => {
                const isOwn = message.senderId === currentUserId;
                const isOffer = message.offerDeadline != null && message.offerStatus != null;

                return (
                  <div
                    key={message.id}
                    data-testid="chat-message"
                    className={`max-w-[85%] rounded-lg p-3 text-sm ${
                      isOwn
                        ? "ml-auto bg-(--primary) text-white"
                        : "bg-(--surface-2) text-(--text-primary)"
                    }`}
                  >
                    {isOffer ? (
                      <>
                        <div className="mb-1 flex items-center gap-2 font-semibold">
                          <span>Proposta de prazo: {formatDate(message.offerDeadline)}</span>
                        </div>

                        <p className="whitespace-pre-wrap break-words">{message.content}</p>

                        {message.offerStatus === "PENDING" && !isOwn && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              label={resolvingId === message.id ? "..." : "Aceitar"}
                              buttonType="button"
                              colorType="success"
                              onClick={() => void handleResolveOffer(message.id, "ACCEPTED")}
                              className="!px-4 !py-1 text-xs"
                              dataTestId="accept-offer-btn"
                            />
                            <Button
                              label="Recusar"
                              buttonType="button"
                              colorType="error"
                              onClick={() => void handleResolveOffer(message.id, "REJECTED")}
                              className="!px-4 !py-1 text-xs"
                              dataTestId="reject-offer-btn"
                            />
                          </div>
                        )}

                        {message.offerStatus !== "PENDING" && (
                          <span className={`mt-1 block text-xs font-semibold ${message.offerStatus === "ACCEPTED" ? "text-(--success)" : "text-(--error)"}`}>
                            {message.offerStatus === "ACCEPTED" ? "Proposta aceita" : "Proposta rejeitada"}
                          </span>
                        )}
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    )}

                    <span className={`mt-1 block text-xs ${isOwn ? "text-white/70" : "text-(--text-muted)"}`}>
                      {isOwn ? "Você" : message.senderId}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Offer deadline picker */}
          {offerMode && (
            <div className="border-t border-(--border-subtle) bg-(--surface-2) p-3">
              <label htmlFor="offer-deadline" className="mb-1 block text-xs text-(--text-muted)">
                Prazo proposto {projectDeadline ? `(limite do projeto: ${formatDate(projectDeadline)})` : ""}
              </label>
              <input
                id="offer-deadline"
                type="date"
                value={offerDate}
                max={projectDeadline ?? undefined}
                onChange={(e) => setOfferDate(e.currentTarget.value)}
                data-testid="offer-deadline-input"
                className="w-full rounded-md border border-(--border-subtle) bg-(--surface-1) p-2 text-sm text-(--text-primary) outline-none"
              />
            </div>
          )}

          {/* Composer */}
          <form
            className="flex items-center gap-2 border-t border-(--border-subtle) p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
          >
            <button
              type="button"
              onClick={() => setOfferMode((prev) => !prev)}
              aria-label="Enviar proposta de prazo"
              title="Enviar proposta de prazo"
              data-testid="offer-mode-btn"
              className={`shrink-0 rounded-full border p-2.5 transition-colors hover:cursor-pointer ${
                offerMode
                  ? "border-(--warning) bg-(--warning) text-white"
                  : "border-(--border-subtle) text-(--text-muted) hover:text-(--text-primary)"
              }`}
            >
              <Calendar size={16} aria-hidden="true" />
            </button>

            <Input
              label=""
              name="chatMessage"
              placeholder={offerMode ? "Descreva sua proposta..." : "Escreva uma mensagem..."}
              value={draft}
              onChange={(e) => setDraft(e.currentTarget.value)}
              dataTestId="chat-input"
            />

            <button
              type="submit"
              disabled={isSending || !draft.trim() || (offerMode && !offerDate)}
              aria-label="Enviar mensagem"
              data-testid="chat-send-btn"
              className="shrink-0 rounded-full bg-(--primary) p-2.5 text-white transition-opacity hover:cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
