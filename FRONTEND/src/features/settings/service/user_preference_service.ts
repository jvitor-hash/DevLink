import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import type {
  UserPreferenceCreate,
  UserPreferenceDTO,
  UserPreferenceUpdate,
} from "@/shared/types/database";

const ENDPOINT = "/api/v1/user-preferences";

class UserPreferenceService {
  async getByUser(userId: string): Promise<ServiceRequestInterface<UserPreferenceDTO | null>> {
    try {
      const result = await APIClient.get<UserPreferenceDTO | null>(`${ENDPOINT}/user/${userId}`);
      return { success: true, data: result ?? null, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async updateByUser(userId: string, data: UserPreferenceUpdate): Promise<ServiceRequestInterface<UserPreferenceDTO>> {
    try {
      const result = await APIClient.put<UserPreferenceDTO>(`${ENDPOINT}/${userId}`, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao atualizar preferências") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async create(data: UserPreferenceCreate): Promise<ServiceRequestInterface<UserPreferenceDTO>> {
    try {
      const result = await APIClient.post<UserPreferenceDTO>(ENDPOINT, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao criar preferências") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const userPreferenceService = new UserPreferenceService();
