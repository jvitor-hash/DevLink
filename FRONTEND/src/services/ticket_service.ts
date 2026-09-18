import type { PaginationParams, TicketCreate, TicketDTO, TicketUpdate } from "@/lib/types/database";
import { apiClient } from "@/lib/api_client";

const endpoint = "/api/v1/tickets";

export const ticketService = {
  create: (data: TicketCreate) => apiClient.post<TicketDTO>(endpoint, data),
  list: (params?: Pick<PaginationParams, "limit" | "offset">) => apiClient.get<TicketDTO[]>(endpoint, params),
  listByProject: (projectId: string) => apiClient.get<TicketDTO[]>(`${endpoint}/project/${projectId}`),
  update: (id: string, data: TicketUpdate) => apiClient.put<TicketDTO>(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete<TicketDTO>(`${endpoint}/${id}`),

  // Live per-status counters for one or more projects.
  countByProjects: (projectIds: string[]) =>
    apiClient.get<{ counts: Record<string, Record<string, number>> }>(`${endpoint}/counts`, {
      projectIds: projectIds.join(","),
    }),
};
