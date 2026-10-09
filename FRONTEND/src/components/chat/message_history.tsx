import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, DollarSign, Search, Send } from "react-feather";
import { messageService } from "@/data/services/message_service";
import { formatRelativeTime } from "@/utils/time_formatting";
import type { MessageDTO } from "@/data/types/database";
import { userSingleton } from "@/context/user";
import { useChat } from "./chat_context";
import { useChatEvents } from "@/hooks/use_chat_events";
import { appendUniqueMessages, retrieveMessagePage } from "./message_history_state";

type MessageHistoryProps = { conversationId: string | null; projectId?: string; clientId?: string };

export default function MessageHistory({
  conversationId,
  projectId,
  clientId,
}: MessageHistoryProps) {
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
        messageType: "MESSAGE",
        offerDeadline: null,
        offerStatus: null,
        offerMoney: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages((current) => appendUniqueMessages(current, [newMessage]));
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
    if (!text) {
      console.log("Send blocked: empty text");
      return;
    }
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      console.log("No conversation selected. Checking conditions...");
      const role = userSingleton.role;
      console.log("Current user role:", role);
      if (role !== "PROGRAMMER") {
        console.error("Clients cannot create new conversations. Please select an existing conversation.");
        return;
      }
      console.log("Programmer creating new conversation...", { projectId, recipientId: clientId });
      try {
        const newConv = await conversationService.create({
          projectId: projectId ?? "",
          userId: userSingleton.id ?? "",
          recipientId: clientId ?? "",
          lastMessage: text,
        });
        console.log("New conversation created:", newConv);
        selectConversation(newConv.id);
        activeConversationId = newConv.id;
      } catch (error) {
        console.error("Failed to create conversation:", error);
        return;
      }
    }
    try {
      console.log("Sending message...", { conversationId: activeConversationId, content: text });
      const result = await messageService.create({
        conversationId: activeConversationId,
        content: text,
        messageType: "MESSAGE",
      });
      console.log("Message created successfully:", result);
      setInputText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const sendOffer = async (): Promise<void> => {
    if (!conversationId || !offerMoney) return;
    await messageService.create({
      conversationId,
      content: offerMessage.trim() || `Proposal: $${offerMoney}`,
      messageType: "OFFER",
      offerStatus: "PENDING",
      offerMoney: Number(offerMoney),
      offerDeadline: offerDeadline
        ? new Date(offerDeadline).toISOString()
        : null,
    });
    setOfferOpen(false);
    setOfferMoney("");
    setOfferDeadline("");
    setOfferMessage("");
    // Message will appear via SSE real-time update
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
              return (
                <div data-testid="chat-message" key={message.id} className={`w-full max-w-75 rounded-sm p-1 px-2 shadow-sm ${isCurrentUser ? "bg-(--primary) self-end" : "bg-(--surface-2)"}`}>
                  <p className={`text-sm ${isCurrentUser ? "text-white" : "text-(--text-primary)"}`}>{message.content}</p>
                  <p className={`text-end text-xs ${isCurrentUser ? "text-white/80" : "text-(--text-muted)"}`}>{formatRelativeTime(message.createdAt)}</p>
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
