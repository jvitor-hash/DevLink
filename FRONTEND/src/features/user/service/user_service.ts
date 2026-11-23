import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import { APIClient } from "@/shared/utils/api_client";
import type { PublicUserDTO, ProminentClientDTO } from "@/shared/types/database";

class UserService {
  async search(q?: string, role?: string, limit = 10): Promise<ServiceRequestInterface<PublicUserDTO[]>> {
    try {
      const result = await APIClient.get<PublicUserDTO[]>("/api/v1/users", { q, role, limit });
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async getById(id: string): Promise<ServiceRequestInterface<PublicUserDTO>> {
    try {
      const result = await APIClient.get<PublicUserDTO>(`/api/v1/users/${id}`);
      if (!result) return { success: false, data: null, errors: new Error("Usuário não encontrado") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async updateMe(data: { name?: string; bio?: string | null }): Promise<ServiceRequestInterface<PublicUserDTO>> {
    try {
      const result = await APIClient.put<PublicUserDTO>("/api/v1/users/me", data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao atualizar perfil") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async getMyPublicKey(): Promise<ServiceRequestInterface<{ publicKey: string | null }>> {
    try {
      const result = await APIClient.get<{ publicKey: string | null }>("/api/v1/users/me/public-key");
      return { success: true, data: result ?? { publicKey: null }, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async updateMyPublicKey(publicKey: string): Promise<ServiceRequestInterface<{ publicKey: string }>> {
    try {
      const result = await APIClient.put<{ publicKey: string }>("/api/v1/users/me/public-key", { publicKey });
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async getPublicKey(userId: string): Promise<ServiceRequestInterface<{ publicKey: string | null }>> {
    try {
      const result = await APIClient.get<{ publicKey: string | null }>(`/api/v1/users/${userId}/public-key`);
      return { success: true, data: result ?? { publicKey: null }, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async getProminentClients(limit = 5): Promise<ServiceRequestInterface<ProminentClientDTO[]>> {
    try {
      const result = await APIClient.get<ProminentClientDTO[]>("/api/v1/users/prominent-clients", { limit });
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const userService = new UserService();
