import type { ListParams, ProjectCreate, ProjectDTO, ProjectUpdate } from "@/data/types/database";
import { apiClient } from "@/utils/api_client";

const endpoints = ["/api/v1/projects"];

export const projectService = {
  create: (data: ProjectCreate): Promise<ProjectDTO> => apiClient.post<ProjectDTO>(endpoints[0], data),
  list: (params?: ListParams): Promise<ProjectDTO[]> => apiClient.get<ProjectDTO[]>(endpoints[0], params),
  listSaved: (params?: Pick<ListParams, "limit" | "offset">): Promise<ProjectDTO[]> =>
    apiClient.get<ProjectDTO[]>(`${endpoints[0]}/saved`, params),
  getById: (id: string): Promise<ProjectDTO> => apiClient.get<ProjectDTO>(`${endpoints[0]}/${id}`),
  update: (id: string, data: ProjectUpdate): Promise<ProjectDTO> => apiClient.put<ProjectDTO>(`${endpoints[0]}/${id}`, data),
  remove: (id: string): Promise<ProjectDTO> => apiClient.delete<ProjectDTO>(`${endpoints[0]}/${id}`),
  countByClients: (clientIds: string[]): Promise<{ counts: Record<string, number> }> =>
    apiClient.get<{ counts: Record<string, number> }>(`${endpoints[0]}/counts/by-client`, {
      clientIds: clientIds.join(","),
    }),

  /** Open project counts grouped by category. */
  countByCategory: (excludeStatuses?: string[]): Promise<{ counts: Record<string, number> }> =>
    apiClient.get<{ counts: Record<string, number> }>(`${endpoints[0]}/counts/by-category`, {
      excludeStatuses,
    }),

  saveProject: (projectId: string): Promise<{ success: boolean }> =>
    apiClient.post<{ success: boolean }>(`${endpoints[0]}/actions`, {
      type: "SAVE_PROJECT",
      payload: { projectId },
    }),
  unsaveProject: (projectId: string): Promise<{ success: boolean }> =>
    apiClient.post<{ success: boolean }>(`${endpoints[0]}/actions`, {
      type: "UNSAVE_PROJECT",
      payload: { projectId },
    }),
};

