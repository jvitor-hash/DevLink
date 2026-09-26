import type { PaginationParams, SavedTicketCreate, SavedTicketDTO, SavedTicketUpdate } from "@/data/types/database";
import { apiClient } from "@/utils/api_client";

const endpoint = "/api/v1/saved-tickets";

export const savedTicketService = {
  create: (data: SavedTicketCreate) => apiClient.post<SavedTicketDTO>(endpoint, data),
  list: (params?: Pick<PaginationParams, "limit" | "offset">) => apiClient.get<SavedTicketDTO[]>(endpoint, params),
  getById: (id: string) => apiClient.get<SavedTicketDTO>(`${endpoint}/${id}`),
  update: (id: string, data: SavedTicketUpdate) => apiClient.put<SavedTicketDTO>(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete<SavedTicketDTO>(`${endpoint}/${id}`),

  /** Saved project ids for a given user. */
  getSavedProjectIdsByUser: (userId: string) =>
    apiClient.get<{ savedProjectIds: string[] }>(`${endpoint}/by-user/${userId}`),

  /** Saved counts per project id. */
  countByProjects: (projectIds: string[]) =>
    apiClient.get<{ counts: Record<string, number> }>(`${endpoint}/counts`, {
      projectIds: projectIds.join(","),
    }),

  /** Toggle saved state for the current user; returns whether the project is now saved. */
  toggle: async (projectId: string): Promise<boolean> => {
    const existing = await savedTicketService.list({ limit: 100 });
    const current = existing.find((item) => item.projectId === projectId);

    if (current) {
      await savedTicketService.remove(current.id);
      return false;
    }

    await savedTicketService.create({ projectId });
    return true;
  },
};
