import { useState } from "react";
import { useParams } from "react-router-dom";
import { Check, Lock, MessageCircle, Send, Unlock, X } from "react-feather";

import { useProjectChat } from "@/lib/hooks/use_project_chat";
import { authService } from "@/services/auth_service";

type ProjectChatPanelProps = {
  open: boolean;
  onToggle: () => void;
};

export default function ProjectChatPanel({ open, onToggle }: ProjectChatPanelProps) {
  const [draft, setDraft] = useState<string>("");
  const [isOfferMode, setIsOfferMode] = useState<boolean>(false);
  const [offerDeadline, setOfferDeadline] = useState<string>("");

  const currentUserId = authService.getCachedUser()?.id;
  const { projectId } = useParams<{ projectId: string }>();
  const { messages, isConnected, isEncrypted, error, sendMessage, sendOffer, respondToOffer } =
    useProjectChat(projectId);

  const submit = (): void => {
    if (!draft.trim()) return;

    if (isOfferMode) {
      if (!offerDeadline) return;
      sendOffer(draft, new Date(offerDeadline).toISOString());
    } else {
      sendMessage(draft);
    }

    setDraft("");
  };

  return (
    <>
      {open ? (
        <div
          data-testid="chat-dock"
          className="flex w-80 flex-col rounded-md border border-(--border-subtle) bg-(--surface-1) xl:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-(--border-subtle) p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-(--text-primary)">
              <MessageCircle size={18} aria-hidden="true" />
              Chat do projeto
            </h2>

            <div className="flex items-center gap-2">
              <span
                data-testid="chat-connection-status"
                title={isConnected ? "Conectado" : "Desconectado"}
                className={`h-2 w-2 rounded-full ${isConnected ? "bg-(--success)" : "bg-(--error)"}`}
              />
              {isEncrypted ? (
                <Lock size={14} aria-label="Mensagens criptografadas" className="text-(--success)" />
              ) : (
                <Unlock size={14} aria-label="Aguardando criptografia" className="text-(--warning)" />
              )}
              <button
                type="button"
                onClick={onToggle}
                aria-label="Fechar chat"
                data-testid="close-chat-btn"
                className="rounded-sm p-1 text-(--text-primary) border border-(--border-subtle)
                hover:cursor-pointer transition-colors hover:bg-(--surface-2) hover:border-(--text-primary)"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {error && <p className="text-sm text-(--error)">{error}</p>}

            {messages.map((message) => {
              const isOwn = message.senderId === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${
                      isOwn
                        ? "bg-(--primary) text-(--text-primary)"
                        : "bg-(--surface-2) text-(--text-primary)"
                    }`}
                  >
                    <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>

                    {message.offerDeadline && (
                      <div className="mt-2 rounded-sm border border-(--border-subtle) bg-(--surface-1) p-2">
                        <p className="text-xs font-semibold text-(--text-primary)">
                          Proposta de prazo: {new Date(message.offerDeadline).toLocaleDateString("pt-BR")}
                        </p>

                        {message.offerStatus ? (
                          <p
                            className={`mt-1 text-xs ${
                              message.offerStatus === "ACCEPTED" ? "text-(--success)" : "text-(--error)"
                            }`}
                            data-testid={`offer-status-${message.id}`}
                          >
                            {message.offerStatus === "ACCEPTED" ? "Proposta aceita" : "Proposta rejeitada"}
                          </p>
                        ) : !isOwn && (
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              aria-label="Aceitar proposta"
                              data-testid={`offer-accept-${message.id}`}
                              onClick={() => respondToOffer(message.id, "ACCEPTED")}
                              className="flex items-center gap-1 rounded-sm bg-(--success) px-2 py-1 text-xs
                              text-white transition-colors hover:cursor-pointer hover:opacity-90"
                            >
                              <Check size={12} aria-hidden="true" />
                              Aceitar
                            </button>
                            <button
                              type="button"
                              aria-label="Rejeitar proposta"
                              data-testid={`offer-reject-${message.id}`}
                              onClick={() => respondToOffer(message.id, "REJECTED")}
                              className="flex items-center gap-1 rounded-sm bg-(--error) px-2 py-1 text-xs
                              text-white transition-colors hover:cursor-pointer hover:opacity-90"
                            >
                              <X size={12} aria-hidden="true" />
                              Rejeitar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="mt-1 text-xs text-(--text-muted)">
                    {isOwn ? "Você" : message.senderId.slice(0, 8)}
                    {message.createdAt && ` • ${new Date(message.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            className="flex justify-between border-t border-(--border-subtle) mb-2"
          >
            <div className="w-full mx-2 mt-2">
              {isOfferMode && (
                <input
                  type="date"
                  value={offerDeadline}
                  onChange={(event) => setOfferDeadline(event.target.value)}
                  aria-label="Prazo proposto"
                  className="mb-2 border border-(--border-subtle) p-2
                  rounded-sm outline-none appearance-none w-full hover:border-gray-400 transition-colors"
                />
              )}

              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="slidedown-animate border border-(--border-subtle) p-4
                rounded-sm outline-none appearance-none w-full hover:border-gray-400 transition-colors"
                placeholder={isOfferMode ? "Descreva a proposta de prazo..." : "Digite sua mensagem aqui..."}
              />
            </div>

            <div className="flex max-w-fit items-center gap-2 mr-2">
              <button
                type="submit"
                aria-label="Enviar mensagem"
                data-testid="chat-send-btn"
                className="w-8 h-8 grid place-items-center rounded-full bg-(--primary) hover:cursor-pointer"
              >
                <Send size={16} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setIsOfferMode((prev) => !prev)}
                aria-pressed={isOfferMode}
                aria-label="Enviar proposta de prazo"
                title="Enviar proposta de prazo"
                data-testid="offer-mode-btn"
                className={`w-8 h-8 rounded-sm border border-(--border-subtle)
                transition-colors hover:cursor-pointer hover:bg-(--surface-3)/50 hover:border-(--text-primary) ${
                  isOfferMode ? "bg-(--surface-3)/50" : ""
                }`}
              >
                $
              </button>
            </div>
          </form>
        </div>
      ) : ""}
    </>
  );
}
