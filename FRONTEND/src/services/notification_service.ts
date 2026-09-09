import type { NotificationCreate, NotificationDTO, NotificationUpdate, PaginationParams } from "@/lib/types/database";
import { apiClient } from "./api_client";

const endpoint = "/api/v1/notification";

export const notificationService = {
  create: (data: NotificationCreate) => apiClient.post<NotificationDTO>(endpoint, data),
  list: (params?: Pick<PaginationParams, "limit" | "offset">) => apiClient.get<NotificationDTO[]>(endpoint, params),
  getById: (id: string) => apiClient.get<NotificationDTO>(`${endpoint}/${id}`),
  update: (id: string, data: NotificationUpdate) => apiClient.put<NotificationDTO>(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete<NotificationDTO>(`${endpoint}/${id}`),
};
