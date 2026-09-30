import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, ChevronLeft, Lock, MessageCircle, Send, Unlock, X } from "react-feather";

import { useProjectChat } from "@/hooks/use_project_chat";
import { countUnseenOffers, countUnseenOffersBySender } from "@/utils/chat_metrics";
import { userSingleton } from "@/context/user";

const formatHistoryDate = (value: string): string => new Date(value).toLocaleDateString("pt-BR");

const formatClock = (value: string): string =>
  new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

type ConversationProps = {
  name: string;
  messageCount: number;
  lastMessageAt: string | null;
  pendingOffers: number;
  onClick: () => void;
};

function ConversationRow({ name, messageCount, lastMessageAt, pendingOffers, onClick }: ConversationProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        data-testid="chat-history-participant"
        className="flex w-full items-center justify-between rounded-sm bg-(--surface-2) px-3 py-2.5 text-sm
        transition-colors hover:cursor-pointer hover:bg-(--surface-3)"
      >
        <span className="truncate text-(--text-primary)">{name}</span>
        <span className="ml-2 flex shrink-0 items-center gap-2 text-xs text-(--text-muted)">
          {pendingOffers > 0 && (
            <span
              data-testid="chat-offer-badge"
              data-count={pendingOffers}
              className="grid h-5 min-w-5 place-items-center rounded-full bg-(--primary) px-1 text-xs font-semibold text-white"
            >
              {pendingOffers}
            </span>
          )}
          {messageCount} {messageCount === 1 ? "mensagem" : "mensagens"}
          {lastMessageAt && ` • ${formatHistoryDate(lastMessageAt)}`}
        </span>
      </button>
    </li>
  );
}type MessageBubbleProps = {
  id: string;
  content: string;
  isOwn: boolean;
  createdAt: string;
  senderName: string;
  offerDeadline: string | null;
  offerStatus: "PENDING" | "ACCEPTED" | "REJECTED" | null;
  canRespond: boolean;
  isUnseen: boolean;
  seenRef: (node: HTMLDivElement | null) => void;
  onAccept: () => void;
  onReject: () => void;
};

function MessageBubble({
  id,
  content,
  isOwn,
  createdAt,
  senderName,
  offerDeadline,
  offerStatus,
  canRespond,
  isUnseen,
  seenRef,
  onAccept,
  onReject,
}: MessageBubbleProps) {
  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      <div
        ref={isUnseen ? seenRef : undefined}
        data-seen-watcher={isUnseen ? "true" : undefined}
        data-message-id={id}
        className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${
          isOwn ? "bg-(--primary) text-(--text-primary)" : "bg-(--surface-2) text-(--text-primary)"
        }`}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{content}</p>

        {offerDeadline && (
          <div className="mt-2 rounded-sm border border-(--border-subtle) bg-(--surface-1) p-2">
            <p className="text-xs font-semibold text-(--text-primary)">
              Proposta de prazo: {new Date(offerDeadline).toLocaleDateString("pt-BR")}
            </p>

            {(offerStatus === "ACCEPTED" || offerStatus === "REJECTED") ? (
              <p
                className={`mt-1 text-xs ${offerStatus === "ACCEPTED" ? "text-(--success)" : "text-(--error)"}`}
                data-testid={`offer-status-${offerStatus.toLowerCase()}`}
                data-message-id={id}
              >
                {offerStatus === "ACCEPTED" ? "Proposta aceita" : "Proposta rejeitada"}
              </p>
            ) : canRespond && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  aria-label="Aceitar proposta"
                  data-testid="offer-accept"
                  data-message-id={id}
                  onClick={onAccept}
                  className="flex items-center gap-1 rounded-sm bg-(--success) px-2 py-1 text-xs
                  text-white transition-colors hover:cursor-pointer hover:opacity-90"
                >
                  <Check size={12} aria-hidden="true" />
                  Aceitar
                </button>
                <button
                  type="button"
                  aria-label="Rejeitar proposta"
                  data-testid="offer-reject"
                  data-message-id={id}
                  onClick={onReject}
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
        {isOwn ? "Você" : senderName} • {formatClock(createdAt)}
      </span>
    </div>
  );
}

type ProjectChatPanelProps = {
  clientId?: string | null;
};

export default function ProjectChatPanel({ clientId }: ProjectChatPanelProps) {
  const [draft, setDraft] = useState<string>("");
  const [isOfferMode, setIsOfferMode] = useState<boolean>(false);
  const [offerDeadline, setOfferDeadline] = useState<string>("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const currentUserId = userSingleton.getCachedUser()?.id;
  const currentUserName = userSingleton.getCachedUser()?.name;
  const { projectId } = useParams<{ projectId: string }>();
  const { messages, participants, isConnected, isEncrypted, capability, error, sendMessage, sendOffer, respondToOffer, markMessagesAsRead } =
    useProjectChat(projectId);

  const isProjectClient = Boolean(currentUserId && clientId && currentUserId === clientId);

  const threadName =
    participants.find((participant) => participant.senderId === activeThreadId)?.name ??
    (activeThreadId ? activeThreadId.slice(0, 8) : "");

  const threadPartnerId = isProjectClient && activeThreadId ? activeThreadId : null;

  // A thread shows that user's messages plus my own replies in it.
  const visibleMessages = useMemo(() => {
    if (!threadPartnerId) return messages;

    return messages.filter(
      (message) => message.senderId === threadPartnerId || message.senderId === currentUserId,
    );
  }, [messages, threadPartnerId, currentUserId]);

  // My name as peers see it, for bubble attribution.
  const senderLabel = (senderId: string): string =>
    senderId === currentUserId ? (currentUserName ?? "Você") :
      (participants.find((participant) => participant.senderId === senderId)?.name ?? senderId.slice(0, 8));

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [visibleMessages.length, activeThreadId]);

  const canWrite = capability === "MESSAGE" || capability === "OFFER";
  const canOffer = capability === "OFFER";

  // Clients see how many offers are still unseen (pending and never opened);
  // the thread view narrows the count to the open conversation.
  const unseenOffers = useMemo(
    () => (isProjectClient ? countUnseenOffers(visibleMessages) : 0),
    [isProjectClient, visibleMessages],
  );

  const unseenOffersBySender = useMemo(
    () => (isProjectClient ? countUnseenOffersBySender(messages) : new Map<string, number>()),
    [isProjectClient, messages],
  );

  // Pop the badge whenever the unseen count grows (a new offer arrived).
  const [badgeBump, setBadgeBump] = useState<number>(0);
  const previousUnseenRef = useRef<number>(0);

  useEffect(() => {
    if (unseenOffers > previousUnseenRef.current) {
      setBadgeBump((tick) => tick + 1);
    }

    previousUnseenRef.current = unseenOffers;
  }, [unseenOffers]);

  // Marks offers seen as they scroll into view inside an open thread; the
  // inbox overview never marks anything, so unseen means "never actually read".
  const observerRef = useRef<IntersectionObserver | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const markSeenRef = useRef(markMessagesAsRead);

  useEffect(() => {
    markSeenRef.current = markMessagesAsRead;
  }, [markMessagesAsRead]);

  useEffect(() => {
    const observer = observerRef.current;

    return () => {
      observer?.disconnect();
      observerRef.current = null;
      seenIdsRef.current = new Set();
    };
  }, []);

  const seenRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => (entry.target as HTMLElement).dataset.messageId ?? "")
            .filter((messageId) => messageId && !seenIdsRef.current.has(messageId));

          if (visible.length) {
            for (const messageId of visible) seenIdsRef.current.add(messageId);

            markSeenRef.current(visible);
          }
        },
        { root: null, threshold: 0.6 },
      );
    }

    observerRef.current.observe(node);
  }, []);

  const submit = (): void => {
    if (!draft.trim()) return;

    if (isOfferMode && canOffer) {
      if (!offerDeadline) return;
      sendOffer(draft, new Date(offerDeadline).toISOString());
      setIsOfferMode(false);
      setOfferDeadline("");
    } else if (canWrite) {
      sendMessage(draft);
    }

    setDraft("");
  };

  return (
    <aside
      data-testid="chat-dock"
      className="flex h-fit max-h-[80vh] w-full flex-col self-stretch rounded-md border border-(--border-subtle) bg-(--surface-1) lg:w-80 xl:w-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--border-subtle) p-4">
        {activeThreadId ? (
          <button
            type="button"
            onClick={() => setActiveThreadId(null)}
            aria-label="Ver todas as conversas"
            data-testid="chat-thread-back"
            className="rounded-sm border border-(--border-subtle) p-1 text-(--text-primary)
            transition-colors hover:cursor-pointer hover:bg-(--surface-2)"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
        ) : (
          <h2 className="flex items-center gap-2 text-lg font-semibold text-(--text-primary)">
            <MessageCircle size={18} aria-hidden="true" />
            Conversas
          </h2>
        )}

        <div className="flex items-center gap-2">
          {unseenOffers > 0 && (
            <span
              key={badgeBump}
              data-testid="chat-offer-badge"
              data-count={unseenOffers}
              title={`${unseenOffers} proposta(s) não vista(s)`}
              className="badge-pop grid h-5 min-w-5 place-items-center rounded-full bg-(--primary) px-1 text-xs font-semibold text-white"
            >
              {unseenOffers}
            </span>
          )}
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
        </div>
      </div>

      {/* Inbox: the owner's initial screen lists every conversation. */}
      {isProjectClient && !activeThreadId && (
        <div className="border-b border-(--border-subtle) p-4" data-testid="chat-history">
          <p className="mb-3 text-sm font-semibold text-(--text-primary)">Conversas do projeto</p>

          {participants.length === 0 ? (
            <p className="text-sm text-(--text-muted)">Nenhuma conversa ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {[...participants]
                .sort((a, b) => {
                  const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
                  const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;

                  return bTime - aTime;
                })
                .map((participant) => (
                  <ConversationRow
                    key={participant.senderId}
                    name={participant.name}
                    messageCount={participant.messageCount}
                    lastMessageAt={participant.lastMessageAt}
                    pendingOffers={unseenOffersBySender.get(participant.senderId) ?? 0}
                    onClick={() => setActiveThreadId(participant.senderId)}
                  />
                ))}
            </ul>
          )}
        </div>
      )}

      {/* Thread header (client browsing one conversation) */}
      {activeThreadId && threadPartnerId && (
        <div className="flex items-center gap-2 border-b border-(--border-subtle) px-4 py-2" data-testid="chat-thread-header">
          <p className="truncate text-sm font-semibold text-(--text-primary)">Conversa com {threadName}</p>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {error && <p className="text-sm text-(--error)">{error}</p>}

        {visibleMessages.length === 0 && (
          <p className="py-6 text-center text-sm text-(--text-muted)">
            Nenhuma mensagem ainda.
          </p>
        )}

        {visibleMessages.map((message) => (
          <MessageBubble
            key={message.id}
            id={message.id}
            content={message.content}
            isOwn={message.senderId === currentUserId}
            createdAt={message.createdAt}
            senderName={senderLabel(message.senderId)}
            offerDeadline={message.offerDeadline}
            offerStatus={message.offerStatus}
            canRespond={Boolean(message.offerDeadline && message.offerStatus === "PENDING" && isProjectClient)}
            isUnseen={Boolean(
              message.offerDeadline &&
              message.offerStatus === "PENDING" &&
              !message.isRead &&
              threadPartnerId === message.senderId,
            )}
            seenRef={seenRef}
            onAccept={() => respondToOffer(message.id, "ACCEPTED")}
            onReject={() => respondToOffer(message.id, "REJECTED")}
          />
        ))}
      </div>

      {/* Composer: programmers only; every client watches read-only. */}
      {canWrite ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="mb-2 flex justify-between border-t border-(--border-subtle)"
        >
          <div className="mx-2 mt-2 w-full">
            {isOfferMode && canOffer && (
              <input
                type="date"
                value={offerDeadline}
                onChange={(event) => setOfferDeadline(event.target.value)}
                aria-label="Prazo proposto"
                className="mb-2 w-full appearance-none rounded-sm border border-(--border-subtle) p-2
                outline-none transition-colors hover:border-gray-400"
              />
            )}

            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="w-full appearance-none rounded-sm border border-(--border-subtle) p-4
              outline-none transition-colors hover:border-gray-400"
              placeholder={isOfferMode && canOffer ? "Descreva a proposta de prazo..." : "Digite sua mensagem aqui..."}
            />
          </div>

          <div className="mr-2 flex max-w-fit items-center gap-2">
            <button
              type="submit"
              aria-label="Enviar mensagem"
              data-testid="chat-send-btn"
              className="grid h-8 w-8 place-items-center rounded-full bg-(--primary) hover:cursor-pointer"
            >
              <Send size={16} aria-hidden="true" />
            </button>

            {canOffer && (
              <button
                type="button"
                onClick={() => setIsOfferMode((prev) => !prev)}
                aria-pressed={isOfferMode}
                aria-label="Enviar proposta de prazo"
                title="Enviar proposta de prazo"
                data-testid="offer-mode-btn"
                className={`h-8 w-8 rounded-sm border border-(--border-subtle)
                transition-colors hover:cursor-pointer hover:bg-(--surface-3)/50 hover:border-(--text-primary) ${
                  isOfferMode ? "bg-(--surface-3)/50" : ""
                }`}
              >
                $
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="border-t border-(--border-subtle) p-3 text-center text-xs text-(--text-muted)">
          Apenas programadores podem enviar mensagens neste chat.
        </p>
      )}
    </aside>
  );
}
