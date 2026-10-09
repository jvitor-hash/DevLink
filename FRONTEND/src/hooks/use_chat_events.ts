import { useEffect, useRef, useState } from "react";
import { BASE_URL, type ChatEventType, type ChatMessageEvent } from "@/data/types/database";

const CHAT_EVENT_TYPES: readonly ChatEventType[] = ["CHAT_MESSAGE"];

export type RawChatEvent = {
  id?: unknown;
  event?: unknown;
  data?: unknown;
};

export const isChatEventType = (value: unknown): value is ChatEventType =>
  typeof value === "string" && (CHAT_EVENT_TYPES as readonly string[]).includes(value);

export const acceptChatEvent = (
  seen: Set<string>,
  raw: RawChatEvent,
  conversationId: string | null,
): ChatMessageEvent | null => {
  const { id, event, data } = raw;

  if (typeof id !== "string" || id.length === 0) return null;
  if (!isChatEventType(event)) return null;
  if (seen.has(id)) return null;

  if (typeof data !== "object" || data === null) return null;
  const eventData = data as Record<string, unknown>;
  const { messageId, conversationId: eventConversationId, content, userId } = eventData;

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
    event,
    data: {
      messageId,
      conversationId: eventConversationId,
      content,
      userId,
    },
  };
};

type UseChatEventsOptions = {
  onMessage: (event: ChatMessageEvent) => void;
};

export function useChatEvents(
  conversationId: string | null,
  options: UseChatEventsOptions,
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

    const source = new EventSource(`${BASE_URL}/api/v1/events/stream`, { withCredentials: true });

    source.onopen = () => setStreamConnected(true);
    source.onerror = () => setStreamConnected(false);

    const handleMessage = (raw: string): void => {
      try {
        const parsed = JSON.parse(raw) as RawChatEvent;
        const event = acceptChatEvent(seenRef.current, parsed, conversationId);

        if (event) onMessageRef.current(event);
      } catch {
        // Malformed frames are ignored; delivery is at-least-once elsewhere.
      }
    };

    for (const type of CHAT_EVENT_TYPES) {
      source.addEventListener(type, (message) => handleMessage((message as MessageEvent<string>).data));
    }

    return () => {
      source.close();
      setStreamConnected(false);
    };
  }, [conversationId]);

  if (!conversationId) return false;

  return streamConnected;
}