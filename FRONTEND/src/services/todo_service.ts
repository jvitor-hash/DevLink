import type { PaginationParams, TodoCreate, TodoDTO, TodoUpdate } from "@/lib/types/database";
import { apiClient } from "@/lib/api_client";

const endpoint = "/api/v1/todos";

export const todoService = {
  create: (data: TodoCreate) => apiClient.post<TodoDTO>(endpoint, data),
  list: (params?: Pick<PaginationParams, "limit" | "offset">) => apiClient.get<TodoDTO[]>(endpoint, params),
  listByProject: (projectId: string) => apiClient.get<TodoDTO[]>(`${endpoint}/project/${projectId}`),
  update: (id: string, data: TodoUpdate) => apiClient.put<TodoDTO>(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete<TodoDTO>(`${endpoint}/${id}`),

  // Live done/total counters for one or more projects.
  countByProjects: (projectIds: string[]) =>
    apiClient.get<{ counts: Record<string, { total: number; done: number }> }>(`${endpoint}/counts`, {
      projectIds: projectIds.join(","),
    }),
};
