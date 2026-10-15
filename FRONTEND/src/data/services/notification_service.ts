import type { NotificationDTO, NotificationUpdate, PaginationParams } from "@/data/types/database";
import { apiClient } from "@/utils/api_client";

const endpoint = "/api/v1/notifications";

export const notificationService = {
  list: (params?: Pick<PaginationParams, "limit" | "offset">): Promise<NotificationDTO[]> =>
    apiClient.get<NotificationDTO[]>(endpoint, params),

  update: (id: string, data: NotificationUpdate): Promise<NotificationDTO> =>
    apiClient.put<NotificationDTO>(`${endpoint}/${id}`, data),

  markAsRead: (id: string): Promise<NotificationDTO> =>
    apiClient.put<NotificationDTO>(`${endpoint}/${id}`, { isRead: true }),

  markAllAsRead: (): Promise<{ success: boolean }> =>
    apiClient.put<{ success: boolean }>(`${endpoint}/read-all`, {}),

  archive: (id: string): Promise<NotificationDTO> =>
    apiClient.put<NotificationDTO>(`${endpoint}/${id}`, { archived: true }),

  unarchive: (id: string): Promise<NotificationDTO> =>
    apiClient.put<NotificationDTO>(`${endpoint}/${id}`, { archived: false }),
};
