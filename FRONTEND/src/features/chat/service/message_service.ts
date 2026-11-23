import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import type { MessageCreate, MessageDTO, MessageUpdate, PaginationParams } from "@/shared/types/database";

const ENDPOINT = "/api/v1/messages";

class MessageService {
  async sendMessage(data: MessageCreate): Promise<ServiceRequestInterface<MessageDTO>> {
    try {
      const result = await APIClient.post<MessageDTO>(ENDPOINT, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao enviar mensagem") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async listMessages(params?: Pick<PaginationParams, "limit" | "offset"> & { conversationId?: string }): Promise<ServiceRequestInterface<MessageDTO[]>> {
    try {
      const result = await APIClient.get<MessageDTO[]>(ENDPOINT, params);
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async getMessageById(id: string): Promise<ServiceRequestInterface<MessageDTO>> {
    try {
      const result = await APIClient.get<MessageDTO>(`${ENDPOINT}/${id}`);
      if (!result) return { success: false, data: null, errors: new Error("Mensagem não encontrada") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async updateMessage(id: string, data: MessageUpdate): Promise<ServiceRequestInterface<MessageDTO>> {
    try {
      const result = await APIClient.put<MessageDTO>(`${ENDPOINT}/${id}`, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao atualizar mensagem") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async deleteMessage(id: string): Promise<ServiceRequestInterface<MessageDTO>> {
    try {
      const result = await APIClient.delete<MessageDTO>(`${ENDPOINT}/${id}`);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao remover mensagem") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const messageService = new MessageService();
