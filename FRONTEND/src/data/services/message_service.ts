import { apiClient } from "@/utils/api_client";

const endpoint = "/api/v1/messages";

export type MessageType = "MESSAGE" | "OFFER";
export type OfferStatus = "PENDING" | "REFUSED" | "ACCEPTED";

export type MessageCreate = {
  conversationId: string;
  content: string;
  isRead?: boolean;
  messageType?: MessageType;
  offerStatus?: OfferStatus | null;
  offerMoney?: number | null;
  offerDeadline?: string | null;
  recipientId?: string;
  projectId?: string;
};

export const messageService = {
  create: (data: MessageCreate) =>
    apiClient.post(endpoint, data),
  list: (params?: { limit?: number; offset?: number; conversationId?: string }) =>
    apiClient.get(endpoint, params),
  getById: (id: string) => apiClient.get(`${endpoint}/${id}`),
  update: (id: string, data: Partial<Omit<MessageCreate, "conversationId">>) =>
    apiClient.put(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${endpoint}/${id}`),
};
