import type { PaginationParams, UserPreferenceCreate, UserPreferenceDTO, UserPreferenceUpdate } from "@/data/types/database";
import { apiClient } from "@/utils/api_client";

const endpoint = "/api/v1/user-preferences";

export const userPreferenceService = {
  create: (data: UserPreferenceCreate) => apiClient.post<UserPreferenceDTO>(endpoint, data),
  list: (params?: Pick<PaginationParams, "limit" | "offset">) => apiClient.get<UserPreferenceDTO[]>(endpoint, params),
  getById: (id: string) => apiClient.get<UserPreferenceDTO>(`${endpoint}/${id}`),
  getByUser: (userId: string) => apiClient.get<UserPreferenceDTO | null>(`${endpoint}/user/${userId}`),
  updateByUser: (userId: string, data: UserPreferenceUpdate) => apiClient.put<UserPreferenceDTO>(`${endpoint}/${userId}`, data),
  remove: (id: string) => apiClient.delete<UserPreferenceDTO>(`${endpoint}/${id}`),
};
