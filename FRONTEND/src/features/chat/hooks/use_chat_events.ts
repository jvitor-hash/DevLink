import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "@/shared/lib/environment";
import type { ChatMessageEvent } from "@/shared/types/database";

export type RawChatEvent = {
  id?: unknown;
  event?: unknown;
  data?: unknown;
};

export const acceptChatEvent = (
  seen: Set<string>,
  raw: RawChatEvent,
  conversationId: string | null
): ChatMessageEvent | null => {
  const { id, event, data } = raw;

  if (typeof id !== "string" || id.length === 0) return null;
  if (event !== "project.chat_message") return null;
  if (seen.has(id)) return null;

  if (typeof data !== "object" || data === null) return null;
  const eventData = data as Record<string, unknown>;
  const {
    messageId,
    conversationId: eventConversationId,
    content,
    userId,
    messageType,
    offerStatus,
    offerMoney,
    offerDeadline,
  } = eventData;

  if (typeof messageId !== "string" || messageId.length === 0) return null;
  if (typeof eventConversationId !== "string" || eventConversationId.length === 0) return null;
  if (typeof content !== "string") return null;
  if (typeof userId !== "string" || userId.length === 0) return null;

  if (conversationId !== null && eventConversationId !== conversationId) return null;

  if (seen.size >= 500) {
    for (const old of seen) {
      seen.delete(old);
      if (seen.size < 250) break;
    }
  }
  seen.add(id);

  return {
    id,
    event: "project.chat_message",
    data: {
      messageId,
      conversationId: eventConversationId,
      content,
      userId,
      messageType: messageType === "OFFER" ? "OFFER" : "MESSAGE",
      offerStatus: offerStatus as any,
      offerMoney: typeof offerMoney === "number" ? offerMoney : null,
      offerDeadline: offerDeadline as any,
    },
  };
};

type UseChatEventsOptions = {
  onMessage: (event: ChatMessageEvent) => void;
};

export function useChatEvents(
  conversationId: string | null,
  options: UseChatEventsOptions
): boolean {
  const { onMessage } = options;
  const [streamConnected, setStreamConnected] = useState<boolean>(false);
  const seenRef = useRef<Set<string>>(new Set());
  const onMessageRef = useRef<(event: ChatMessageEvent) => void>(options.onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!conversationId) return;

    const source = new EventSource(`${BASE_URL}/api/v1/events/stream`, {
      withCredentials: true,
    });

    source.onopen = () => setStreamConnected(true);
    source.onerror = () => setStreamConnected(false);

    const handleMessage = (message: MessageEvent<string>): void => {
      try {
        const parsed = JSON.parse(message.data) as Omit<RawChatEvent, "id" | "event">;
        const event = acceptChatEvent(
          seenRef.current,
          {
            ...parsed,
            id: message.lastEventId,
            event: message.type,
          },
          conversationId
        );

        if (event) onMessageRef.current(event);
      } catch {
        // ignore malformed
      }
    };

    source.addEventListener("project.chat_message", (m) =>
      handleMessage(m as MessageEvent<string>)
    );

    return () => {
      source.close();
      setStreamConnected(false);
    };
  }, [conversationId]);

  if (!conversationId) return false;

  return streamConnected;
}
