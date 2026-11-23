import { useState, useEffect, useCallback } from "react";
import { conversationService } from "../service/conversation_service";
import type { ConversationDTO, ConversationCreate } from "@/shared/types/database";

export function useConversations(projectId?: string) {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await conversationService.listConversations(projectId ? { projectId } : undefined);
    if (result.success && result.data) {
      setConversations(result.data);
      if (result.data.length > 0 && !activeConversationId) {
        setActiveConversationId(result.data[0].id);
      }
    } else {
      setError(result.errors?.message || "Falha ao carregar conversas.");
    }
    setLoading(false);
  }, [projectId, activeConversationId]);

  useEffect(() => {
    fetchConversations();
  }, [projectId, fetchConversations]);

  const createConversation = useCallback(async (data: ConversationCreate) => {
    const result = await conversationService.createConversation(data);
    if (result.success && result.data) {
      setConversations((prev) => [result.data!, ...prev]);
      setActiveConversationId(result.data.id);
      return result.data;
    }
    return null;
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  return {
    conversations,
    activeConversationId,
    activeConversation,
    setActiveConversationId,
    loading,
    error,
    createConversation,
    refetch: fetchConversations,
  };
}
