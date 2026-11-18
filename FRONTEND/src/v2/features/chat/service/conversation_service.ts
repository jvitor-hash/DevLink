import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import type { ConversationCreate, ConversationDTO } from "@/shared/types/database";

const ENDPOINT = "/api/v1/conversations";

class ConversationService {
  async createConversation(data: ConversationCreate): Promise<ServiceRequestInterface<ConversationDTO>> {
    try {
      const result = await APIClient.post<ConversationDTO>(ENDPOINT, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao criar conversa") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async listConversations(params?: { projectId?: string }): Promise<ServiceRequestInterface<ConversationDTO[]>> {
    try {
      const result = await APIClient.get<ConversationDTO[]>(ENDPOINT, params);
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async getConversationById(id: string): Promise<ServiceRequestInterface<ConversationDTO>> {
    try {
      const result = await APIClient.get<ConversationDTO>(`${ENDPOINT}/${id}`);
      if (!result) return { success: false, data: null, errors: new Error("Conversa não encontrada") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const conversationService = new ConversationService();
