import type { MessageCreate, MessageDTO, MessageUpdate, PaginationParams } from "@/lib/types/database";
import { apiClient } from "@/lib/api_client";

const endpoint = "/api/v1/messages";

export const messageService = {
  create: (data: MessageCreate) => apiClient.post<MessageDTO>(endpoint, data),
  list: (params?: Pick<PaginationParams, "limit" | "offset">) => apiClient.get<MessageDTO[]>(endpoint, params),
  listByProject: (projectId: string, params?: Pick<PaginationParams, "limit" | "offset">) =>
    apiClient.get<MessageDTO[]>(`${endpoint}/project/${projectId}`, params),
  getById: (id: string) => apiClient.get<MessageDTO>(`${endpoint}/${id}`),
  update: (id: string, data: MessageUpdate) => apiClient.put<MessageDTO>(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete<MessageDTO>(`${endpoint}/${id}`),

  // Pending negotiation offers the user can resolve, for live badges.
  countPendingOffers: () => apiClient.get<{ total: number }>(`${endpoint}/offers/pending`),

  // Accept/reject a negotiation offer; accepting assigns the programmer,
  // sets the project deadline and moves it to IN_DEVELOPMENT.
  resolveOffer: (id: string, decision: "ACCEPTED" | "REJECTED") =>
    apiClient.put<MessageDTO>(`${endpoint}/${id}/offer`, { decision }),
};
