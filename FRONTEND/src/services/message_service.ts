import type { MessageCreate, MessageDTO, MessageUpdate, PaginationParams } from "@/lib/types/database";
import { apiClient } from "@/lib/api_client";

const endpoint = "/api/v1/message";

export const messageService = {
  create: (data: MessageCreate) => apiClient.post<MessageDTO>(endpoint, data),
  list: (params?: Pick<PaginationParams, "limit" | "offset">) => apiClient.get<MessageDTO[]>(endpoint, params),
  getById: (id: string) => apiClient.get<MessageDTO>(`${endpoint}/${id}`),
  update: (id: string, data: MessageUpdate) => apiClient.put<MessageDTO>(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete<MessageDTO>(`${endpoint}/${id}`),
};
