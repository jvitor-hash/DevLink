import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, ChevronLeft, Clock, Lock, MessageCircle, Send, Unlock, X } from "react-feather";

import { useProjectChat, type ChatParticipant } from "@/hooks/use_project_chat";
import { userSingleton } from "@/context/user";

type ProjectChatPanelProps = {
  open: boolean;
  onToggle: () => void;
  clientId?: string | null;
};

const formatHistoryDate = (value: string | null): string => {
  if (!value) return "";

  return new Date(value).toLocaleDateString("pt-BR");
};

type ChatHistoryProps = {
  participants: ChatParticipant[];
  isProjectClient: boolean;
  activeSenderId: string | null;
  onSelectParticipant: (senderId: string | null) => void;
};

function ChatHistory({ participants, isProjectClient, activeSenderId, onSelectParticipant }: ChatHistoryProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  if (!participants.length) return null;

  // Inbox order: most recent conversation first.
  const sorted = [...participants].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;

    return bTime - aTime;
  });

  return (
    <div className="border-b border-(--border-subtle) p-4" data-testid="chat-history">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between text-sm font-semibold text-(--text-primary)
        hover:cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Clock size={14} aria-hidden="true" />
          Histórico da conversa
        </span>
        <span className="text-xs font-normal text-(--text-muted)">{participants.length}</span>
      </button>

      {expanded && (
        <ul className="mt-3 flex flex-col gap-2">
          {sorted.map((participant) => {
            const isActive = isProjectClient && activeSenderId === participant.senderId;

            if (!isProjectClient) {
              return (
                <li
                  key={participant.senderId}
                  data-testid={`chat-history-participant-${participant.senderId}`}
                  className="flex items-center justify-between rounded-sm bg-(--surface-2) px-2 py-1.5 text-sm"
                >
                  <span className="truncate text-(--text-primary)">{participant.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-(--text-muted)">
                    {participant.messageCount} {participant.messageCount === 1 ? "mensagem" : "mensagens"}
                    {participant.lastMessageAt && ` • ${formatHistoryDate(participant.lastMessageAt)}`}
                  </span>
                </li>
              );
            }

            return (
              <li key={participant.senderId} data-testid={`chat-history-participant-${participant.senderId}`}>
                <button
                  type="button"
                  onClick={() => onSelectParticipant(isActive ? null : participant.senderId)}
                  aria-pressed={isActive}
                  className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors ${
                    isActive ? "border border-(--primary) bg-(--surface-3)/50" : "border border-transparent bg-(--surface-2)"
                  } ${isProjectClient ? "hover:cursor-pointer hover:border-(--primary)" : ""}`}
                >
                  <span className="truncate text-(--text-primary)">{participant.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-(--text-muted)">
                    {participant.messageCount} {participant.messageCount === 1 ? "mensagem" : "mensagens"}
                    {participant.lastMessageAt && ` • ${formatHistoryDate(participant.lastMessageAt)}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function ProjectChatPanel({ open, onToggle, clientId }: ProjectChatPanelProps) {
  const [draft, setDraft] = useState<string>("");
  const [isOfferMode, setIsOfferMode] = useState<boolean>(false);
  const [offerDeadline, setOfferDeadline] = useState<string>("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const currentUserId = userSingleton.getCachedUser()?.id;
  const { projectId } = useParams<{ projectId: string }>();
  const { messages, participants, isConnected, isEncrypted, error, sendMessage, sendOffer, respondToOffer } =
    useProjectChat(projectId);

  // Only the client who created the project browses messages per user.
  const isProjectClient = Boolean(currentUserId && clientId && currentUserId === clientId);

  const threadName =
    participants.find((participant) => participant.senderId === activeThreadId)?.name ??
    (activeThreadId ? activeThreadId.slice(0, 8) : "");

  // A thread shows that user's messages plus my own replies in it.
  const visibleMessages = useMemo(() => {
    if (!activeThreadId) return messages;

    return messages.filter(
      (message) => message.senderId === activeThreadId || message.senderId === currentUserId,
    );
  }, [messages, activeThreadId, currentUserId]);

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

          {/* Conversation history */}
          <ChatHistory
            participants={participants}
            isProjectClient={isProjectClient}
            activeSenderId={activeThreadId}
            onSelectParticipant={setActiveThreadId}
          />

          {/* Thread header (client browsing one conversation) */}
          {activeThreadId && (
            <div
              className="flex items-center gap-2 border-b border-(--border-subtle) px-4 py-2"
              data-testid="chat-thread-header"
            >
              <button
                type="button"
                onClick={() => setActiveThreadId(null)}
                aria-label="Ver todas as mensagens"
                data-testid="chat-thread-back"
                className="rounded-sm border border-(--border-subtle) p-1 text-(--text-primary)
                transition-colors hover:cursor-pointer hover:bg-(--surface-2)"
              >
                <ChevronLeft size={14} aria-hidden="true" />
              </button>
              <p className="truncate text-sm font-semibold text-(--text-primary)">
                Conversa com {threadName}
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {error && <p className="text-sm text-(--error)">{error}</p>}

            {visibleMessages.map((message) => {
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

                        {(message.offerStatus === "ACCEPTED" || message.offerStatus === "REJECTED") ? (
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
