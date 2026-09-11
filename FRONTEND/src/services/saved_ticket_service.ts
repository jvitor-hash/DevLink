import type { PaginationParams, SavedTicketCreate, SavedTicketDTO, SavedTicketUpdate } from "@/lib/types/database";
import { apiClient } from "./api_client";

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

  /** Toggle saved state for the current user; returns the resulting SavedTicket row. */
  toggle: async (projectId: string): Promise<SavedTicketDTO> => {
    const existing = await savedTicketService.list({ limit: 100 });
    const alreadySaved = existing.some((item) => item.projectId === projectId);

    if (alreadySaved) {
      const item = existing.find((i) => i.projectId === projectId);
      if (!item) throw new Error("Saved ticket not found");
      await savedTicketService.remove(item.id);
      return item;
    }

    const created = await savedTicketService.create({ userId: "", projectId });
    return created;
  },
};
