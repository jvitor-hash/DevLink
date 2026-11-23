import { useState, useEffect, useCallback } from "react";
import { messageService } from "../service/message_service";
import { useChatEvents } from "./use_chat_events";
import type { MessageDTO, MessageCreate, OfferStatus } from "@/shared/types/database";
import { toast } from "@/shared/utils/toast_store";

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(conversationId));
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await messageService.listMessages({ conversationId, limit: 100 });
    if (result.success && result.data) {
      setMessages(result.data);
    } else {
      setError(result.errors?.message || "Falha ao carregar mensagens.");
    }
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [conversationId, fetchMessages]);

  // Realtime incoming message listener via SSE
  useChatEvents(conversationId, {
    onMessage: (event) => {
      const incoming: MessageDTO = {
        id: event.data.messageId,
        conversationId: event.data.conversationId,
        senderId: event.data.userId,
        content: event.data.content,
        isRead: false,
        messageType: event.data.messageType || "MESSAGE",
        offerStatus: event.data.offerStatus,
        offerMoney: typeof event.data.offerMoney === "number" ? event.data.offerMoney : null,
        offerDeadline: event.data.offerDeadline,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;
        return [...prev, incoming];
      });
    },
  });

  const sendMessage = useCallback(
    async (data: Omit<MessageCreate, "conversationId">) => {
      if (!conversationId) return null;

      const payload: MessageCreate = {
        ...data,
        conversationId,
      };

      const result = await messageService.sendMessage(payload);
      if (result.success && result.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === result.data!.id)) return prev;
          return [...prev, result.data!];
        });
        return result.data;
      } else {
        toast.error("Falha ao enviar mensagem.");
        return null;
      }
    },
    [conversationId]
  );

  const respondToOffer = useCallback(
    async (messageId: string, status: OfferStatus) => {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, offerStatus: status } : m))
      );

      const result = await messageService.updateMessage(messageId, { offerStatus: status });
      if (!result.success) {
        toast.error("Falha ao responder à proposta.");
        fetchMessages();
      } else {
        toast.success(status === "ACCEPTED" ? "Proposta aceita!" : "Proposta recusada.");
      }
    },
    [fetchMessages]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    respondToOffer,
    refetch: fetchMessages,
  };
}
