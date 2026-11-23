import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import type { NotificationDTO, NotificationUpdate, PaginationParams } from "@/shared/types/database";

const ENDPOINT = "/api/v1/notifications";

class NotificationService {
  async list(params?: Pick<PaginationParams, "limit" | "offset">): Promise<ServiceRequestInterface<NotificationDTO[]>> {
    try {
      const result = await APIClient.get<NotificationDTO[]>(ENDPOINT, params);
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async update(id: string, data: NotificationUpdate): Promise<ServiceRequestInterface<NotificationDTO>> {
    try {
      const result = await APIClient.put<NotificationDTO>(`${ENDPOINT}/${id}`, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao atualizar notificação") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async markAsRead(id: string): Promise<ServiceRequestInterface<NotificationDTO>> {
    return this.update(id, { isRead: true });
  }

  async markAllAsRead(): Promise<ServiceRequestInterface<{ success: boolean }>> {
    try {
      const result = await APIClient.put<{ success: boolean }>(`${ENDPOINT}/read-all`, {});
      return { success: true, data: result ?? { success: true }, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async archive(id: string): Promise<ServiceRequestInterface<NotificationDTO>> {
    return this.update(id, { archived: true });
  }

  async unarchive(id: string): Promise<ServiceRequestInterface<NotificationDTO>> {
    return this.update(id, { archived: false });
  }
}

export const notificationService = new NotificationService();
