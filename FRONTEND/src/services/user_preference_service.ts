import type { PaginationParams, UserPreferenceCreate, UserPreferenceDTO, UserPreferenceUpdate } from "@/lib/types/database";
import { apiClient } from "./api_client";

const endpoint = "/api/v1/user_preferences";

export const userPreferenceService = {
  create: (data: UserPreferenceCreate) => apiClient.post<UserPreferenceDTO>(endpoint, data),
  list: (params?: Pick<PaginationParams, "limit" | "offset">) => apiClient.get<UserPreferenceDTO[]>(endpoint, params),
  getById: (id: string) => apiClient.get<UserPreferenceDTO>(`${endpoint}/${id}`),
  update: (id: string, data: UserPreferenceUpdate) => apiClient.put<UserPreferenceDTO>(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete<UserPreferenceDTO>(`${endpoint}/${id}`),
};
