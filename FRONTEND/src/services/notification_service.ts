import type { NotificationDTO, NotificationUpdate, PaginationParams } from "@/lib/types/database";
import { apiClient } from "@/lib/api_client";

const endpoint = "/api/v1/notifications";

export const notificationService = {
  list: (params?: Pick<PaginationParams, "limit" | "offset">) => apiClient.get<NotificationDTO[]>(endpoint, params),
  getById: (id: string) => apiClient.get<NotificationDTO>(`${endpoint}/${id}`),
  update: (id: string, data: NotificationUpdate) => apiClient.put<NotificationDTO>(`${endpoint}/${id}`, data),
};
