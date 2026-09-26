import type { PublicUserDTO, ProminentClientDTO } from "@/data/types/database";
import { apiClient } from "@/utils/api_client";

const endpoint = "/api/v1/users";

export const userService = {
  search: (q?: string, role?: string, limit = 10) =>
    apiClient.get<PublicUserDTO[]>(endpoint, { q, role, limit }),
  getProminentClients: (limit = 5) =>
    apiClient.get<ProminentClientDTO[]>(`${endpoint}/prominent-clients`, { limit }),
  getById: (id: string) => apiClient.get<PublicUserDTO>(`${endpoint}/${id}`),

  /** Update the authenticated user's own profile (name, bio, image). */
  updateMe: (data: { name?: string; bio?: string | null; image?: string | null }) =>
    apiClient.put<PublicUserDTO>(`${endpoint}/me`, data),

  getMyPublicKey: () => apiClient.get<{ publicKey: string | null }>(`${endpoint}/me/public-key`),
  updateMyPublicKey: (publicKey: string) =>
    apiClient.put<{ publicKey: string }>(`${endpoint}/me/public-key`, { publicKey }),
  getPublicKey: (userId: string) =>
    apiClient.get<{ publicKey: string | null }>(`${endpoint}/${userId}/public-key`),
};
