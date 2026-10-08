import { apiClient } from "@/utils/api_client";

const endpoint = "/api/v1/conversations";

export const conversationService = {
  create: (data: { projectId: string; userId: string; recipientId: string; lastMessage?: string; unreadMessages?: number }) =>
    apiClient.post(endpoint, data),
  list: (params?: { projectId?: string }) => apiClient.get(endpoint, params),
  getById: (id: string) => apiClient.get(`${endpoint}/${id}`),
};
