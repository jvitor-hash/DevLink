import type { PublicUserDTO, ProminentClientDTO } from "@/lib/types/database";
import { apiClient } from "./api_client";

const endpoint = "/api/v1/users";

export const userService = {
  search: (q?: string, role?: string, limit = 10) =>
    apiClient.get<PublicUserDTO[]>(endpoint, { q, role, limit }),
  getProminentClients: (limit = 5) =>
    apiClient.get<ProminentClientDTO[]>(`${endpoint}/prominent-clients`, { limit }),
  getById: (id: string) => apiClient.get<PublicUserDTO>(`${endpoint}/${id}`),
};
