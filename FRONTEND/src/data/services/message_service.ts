import { apiClient } from "@/utils/api_client";

const endpoint = "/api/v1/messages";

export const messageService = {
  create: (data: { conversationId: string; content: string; isRead?: boolean }) =>
    apiClient.post(endpoint, data),
  list: (params?: { limit?: number; offset?: number; conversationId?: string }) =>
    apiClient.get(endpoint, params),
  getById: (id: string) => apiClient.get(`${endpoint}/${id}`),
  update: (id: string, data: Partial<{ content?: string; isRead?: boolean }>) =>
    apiClient.put(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${endpoint}/${id}`),
};
