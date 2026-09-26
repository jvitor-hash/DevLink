import type { MessageDTO, MessageUpdate } from "@/data/types/database";
import { apiClient } from "@/utils/api_client";

const endpoint = "/api/v1/messages";

export const messageService = {
  create: (data: { projectId: string; content: string; offerDeadline?: string | null }) =>
    apiClient.post<MessageDTO>(endpoint, data),
  list: (params?: { limit?: number; offset?: number }) => apiClient.get<MessageDTO[]>(endpoint, params),
  listByProject: (projectId: string) => apiClient.get<MessageDTO[]>(`${endpoint}/project/${projectId}`),
  listByProjectSince: (projectId: string, after: string) =>
    apiClient.get<MessageDTO[]>(`${endpoint}/project/${projectId}/since`, { after }),
  unreadCount: (projectId: string) =>
    apiClient.get<{ count: number }>(`${endpoint}/project/${projectId}/unread`),
  update: (id: string, data: MessageUpdate) => apiClient.put<MessageDTO>(`${endpoint}/${id}`, data),
};
