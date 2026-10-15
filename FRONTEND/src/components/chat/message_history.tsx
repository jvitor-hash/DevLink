import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, DollarSign, Search, Send } from "react-feather";
import { messageService } from "@/data/services/message_service";
import { formatRelativeTime } from "@/utils/time_formatting";
import type { MessageDTO } from "@/data/types/database";
import { userSingleton } from "@/context/user";
import { useChat } from "./chat_context";
import { useChatEvents } from "@/hooks/use_chat_events";
import { appendUniqueMessages, canSendMessage, retrieveMessagePage } from "./message_history_state";
import { conversationService } from "@/data/services/conversation_service";

type MessageHistoryProps = { conversationId: string | null; projectId?: string; };

export default function MessageHistory({ conversationId, projectId }: MessageHistoryProps) {
  const { selectConversation } = useChat();
  const currentUserId = userSingleton.id ?? "";
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerMoney, setOfferMoney] = useState("");
  const [offerDeadline, setOfferDeadline] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [respondingOfferId, setRespondingOfferId] = useState<string | null>(null);
  const respondingOfferRef = useRef<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messageListRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (offset: number, append: boolean): Promise<void> => {
    if (!conversationId) return;
    setLoadingMore(true);
    try {
      const nextMessages = await retrieveMessagePage(
        (params) => messageService.list(params) as Promise<MessageDTO[]>,
        conversationId,
        offset,
      );
      setMessages((current) => append ? appendUniqueMessages(current, nextMessages) : nextMessages);
      setHasMore(nextMessages.length === 20);
    } catch {
      if (!append) setMessages([]);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId]);

  // Real-time message updates via SSE
  useChatEvents(conversationId, {
    onMessage: (event) => {
      const newMessage: MessageDTO = {
        id: event.data.messageId,
        conversationId: event.data.conversationId,
        userId: event.data.userId,
        content: event.data.content,
        isRead: event.data.userId === currentUserId,
        readAt: event.data.userId === currentUserId ? new Date().toISOString() : null,
        messageType: event.data.messageType ?? "MESSAGE",
        offerDeadline: event.data.offerDeadline ?? null,
        offerStatus: event.data.offerStatus ?? null,
        offerMoney: event.data.offerMoney ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages((current) => appendUniqueMessages(current, [newMessage]));
      console.log("Message recieved on SSE");
    },
  });

  useEffect(() => {
    void (async (): Promise<void> => {
      await loadMessages(0, false);
    })();
  }, [conversationId, loadMessages]);

  const handleMessageScroll = (): void => {
    const element = messageListRef.current;
    if (!element || loadingMore || !hasMore || !conversationId) return;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 24) {
      void loadMessages(messages.length, true);
    }
  };

  const sendMessage = async (): Promise<void> => {
    const text = inputText.trim();

    if (!text) return;

    let activeConversationId = conversationId;

    if (!canSendMessage(userSingleton.role ?? "", activeConversationId)) return;

    try {
      if (!activeConversationId) {
        console.log("No conversation selected. Checking conditions...");
        const newConv = await conversationService.create({
          projectId: projectId ?? "",
          userId: userSingleton.id ?? "",
        });

        console.log("New conversation created:", newConv);
        activeConversationId = newConv.id;
        selectConversation(newConv.id);
      }

      console.log("Sending message...", { conversationId: activeConversationId, content: text });
      const result = await messageService.create({
        conversationId: activeConversationId,
        content: text,
        messageType: "MESSAGE",
      });

      console.log("Message created successfully:", result);
      setMessages((current) =>
        appendUniqueMessages(current, [result as MessageDTO])
      );

      setInputText("");
    } catch (error) {
      console.error("Failed to send message:", error);

      return;
    }
  };

  const sendOffer = async (): Promise<void> => {
    if (!conversationId || !offerMoney) return;

    try {
      const result = await messageService.create({
        conversationId,
        content: offerMessage.trim() || `Proposal: $${offerMoney}`,
        messageType: "OFFER",
        offerStatus: "PENDING",
        offerMoney: Number(offerMoney),
        offerDeadline: offerDeadline
          ? new Date(offerDeadline).toISOString()
          : null,
      });

      setMessages((current) => appendUniqueMessages(current, [result as MessageDTO]));
      setOfferOpen(false);
      setOfferMoney("");
      setOfferDeadline("");
      setOfferMessage("");
    } catch (error) {
      console.error("Failed to send offer:", error);
    }
  };

  const respondToOffer = async (message: MessageDTO, offerStatus: "ACCEPTED" | "REFUSED"): Promise<void> => {
    if (respondingOfferRef.current || message.offerStatus !== "PENDING") return;

    respondingOfferRef.current = message.id;
    setRespondingOfferId(message.id);

    try {
      const updated = await messageService.update(message.id, { offerStatus });
      setMessages((current) => current.map((item) => item.id === message.id ? updated as MessageDTO : item));
    } catch (error) {
      console.error("Failed to respond to offer:", error);
    } finally {
      respondingOfferRef.current = null;
      setRespondingOfferId(null);
    }
  };

  const filteredMessages = messages.filter((message) =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const visibleMessages = filteredMessages;
  return (
    <div className="flex-8">
      <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto]">
        <header className="flex flex-col border-b border-(--border-subtle) p-3">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <button
                className="cursor-pointer border-none p-1 transition-colors hover:bg-(--surface-3)/95"
                onClick={() => selectConversation(null)}
              >
                <ChevronLeft size={16} color="var(--text-primary)" />
              </button>
              <p className="text-base text-(--text-primary)">
                {conversationId ?? "Select a conversation"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`cursor-pointer border-none p-1 transition-colors ${searchOpen ? "bg-(--surface-3)/95" : "hover:bg-(--surface-3)/95"}`}
                onClick={() => setSearchOpen((value) => !value)}
              ><Search size={16} color="var(--text-primary)" />
              </button>
            </div>
          </div>
          {searchOpen && (
            <input
              type="text"
              placeholder="Search chat messages...."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="mt-2 w-full max-w-sm rounded-sm border border-(--border-subtle) p-2 text-(--text-secondary) outline-none"
            />
          )}
        </header>
        <div ref={messageListRef} onScroll={handleMessageScroll} className="min-h-0 overflow-y-auto p-2">
          <div className="flex flex-col gap-2">
            {!conversationId && (
              <div className="text-sm text-(--text-muted) text-center">
                Select a conversation to view messages.
              </div>
            )}
            {conversationId && messages.length === 0 && (
              <div className="text-sm text-(--text-muted) text-center">
                No messages yet.
              </div>
            )}
            {visibleMessages.map((message) => {
              const isCurrentUser = message.userId === currentUserId;
              const isOffer = message.messageType === "OFFER";
              return (
                <div data-testid="chat-message" key={message.id} className={`w-full max-w-75 rounded-md p-2 px-3 shadow-sm ${isOffer ? "border-2 border-(--primary) bg-(--surface-2)" : isCurrentUser ? "bg-(--primary)" : "bg-(--surface-2)"} ${isCurrentUser ? "self-end" : ""}`}>
                  {isOffer && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--primary)">Proposta de negociação</p>}
                  <p className={`text-sm ${isOffer || !isCurrentUser ? "text-(--text-primary)" : "text-white"}`}>{message.content}</p>
                  {isOffer && (
                    <div className="mt-2 space-y-1 border-t border-(--border-subtle) pt-2 text-xs text-(--text-secondary)">
                      {message.offerMoney != null && <p><span className="font-semibold">Valor:</span> R$ {Number(message.offerMoney).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>}
                      {message.offerDeadline && <p><span className="font-semibold">Prazo:</span> {new Date(message.offerDeadline).toLocaleString("pt-BR")}</p>}
                      <p><span className="font-semibold">Status:</span> {message.offerStatus === "PENDING" ? "Aguardando resposta" : message.offerStatus === "ACCEPTED" ? "Aceita" : "Recusada"}</p>
                      {!isCurrentUser && message.offerStatus === "PENDING" && (
                        <div className="mt-2 flex gap-2">
                          <button data-testid="offer-accept" type="button" disabled={respondingOfferId !== null} onClick={() => void respondToOffer(message, "ACCEPTED")} className="flex-1 rounded bg-(--success) px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-50">Aceitar</button>
                          <button data-testid="offer-reject" type="button" disabled={respondingOfferId !== null} onClick={() => void respondToOffer(message, "REFUSED")} className="flex-1 rounded bg-(--error) px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-50">Recusar</button>
                        </div>
                      )}
                    </div>
                  )}
                  <p className={`text-end text-xs ${isCurrentUser ? "text-white/80" : "text-(--text-muted)"}`}>{message.isRead ? formatRelativeTime(message.createdAt) : "Lido " + formatRelativeTime(message.readAt).toString()}</p>
                </div>
              );
            })}
          </div>
          {loadingMore && <p className="text-center text-xs text-(--text-muted)">Loading messages...</p>}
        </div>
        <footer className="relative flex items-center gap-2 border-t border-(--border-subtle) p-3">
          {offerOpen && (
            <div className="absolute bottom-16 right-4 bg-(--surface-2) border border-(--border-subtle) rounded-sm p-3 shadow-lg z-50">
              <p className="text-sm font-semibold mb-2">Negotiation Proposal</p>
              <input
                type="text"
                placeholder="Amount"
                value={offerMoney}
                onChange={(event) => setOfferMoney(event.target.value)}
                className="w-full mb-1 rounded-sm border border-(--border-subtle) p-1 text-sm"
              />
              <input
                type="datetime-local"
                value={offerDeadline}
                onChange={(event) => setOfferDeadline(event.target.value)}
                className="w-full mb-1 rounded-sm border border-(--border-subtle) p-1 text-sm"
              />
              <textarea
                placeholder="Optional message"
                value={offerMessage}
                onChange={(event) => setOfferMessage(event.target.value)}
                className="w-full mb-2 rounded-sm border border-(--border-subtle) p-1 text-sm"
              />
              <button
                onClick={() => sendOffer()}
                className="w-full rounded-sm bg-(--primary) p-1 text-xs text-white"
              >
                Send Proposal
              </button>
            </div>
          )}
          <input
            data-testid="chat-message-input"
            className="w-full rounded-sm border border-(--border-subtle) p-2 text-(--text-secondary) outline-none"
            placeholder="Digite sua mensagem..."
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
          />
          <button
            className="cursor-pointer rounded-sm bg-(--primary) p-2"
            onClick={() => setOfferOpen((value) => !value)}
          >
            <DollarSign size={16} color="white" />
          </button>
          <button
            className="cursor-pointer rounded-sm bg-(--primary) p-2"
            data-testid="chat-send-message"
            onClick={() => sendMessage()}
          >
            <Send size={16} color="white" />
          </button>
        </footer>
      </div>
    </div>
  );
}
