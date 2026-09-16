import type { ListParams, ProjectCreate, ProjectDTO, ProjectUpdate } from "@/lib/types/database";
import { apiClient } from "./api_client";

const endpoint = "/api/v1/projects";

export const projectService = {
  create: (data: ProjectCreate) => apiClient.post<ProjectDTO>(endpoint, data),
  list: (params?: ListParams) => apiClient.get<ProjectDTO[]>(endpoint, params),
  getById: (id: string) => apiClient.get<ProjectDTO>(`${endpoint}/${id}`),
  update: (id: string, data: ProjectUpdate) => apiClient.put<ProjectDTO>(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete<ProjectDTO>(`${endpoint}/${id}`),
  countByClients: (clientIds: string[]) =>
    apiClient.get<{ counts: Record<string, number> }>(`${endpoint}/counts/by-client`, {
      clientIds: clientIds.join(","),
    }),
};
