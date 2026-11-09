import { apiClient } from "@/utils/api_client";
import type { ConversationCreate, ConversationDTO } from "../types/database";

const endpoint = "/api/v1/conversations";

export const conversationService = {
  create: (data: ConversationCreate) =>
    apiClient.post<ConversationDTO>(endpoint, data),
  list: (params?: { projectId?: string }) => apiClient.get<ConversationDTO[]>(endpoint, params),
  getById: (id: string) => apiClient.get<ConversationDTO>(`${endpoint}/${id}`),
};
