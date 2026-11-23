import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import type { TicketCreate, TicketDTO, TicketUpdate, PaginationParams } from "@/shared/types/database";

const ENDPOINT = "/api/v1/tickets";

class TicketService {
  async createTicket(data: TicketCreate): Promise<ServiceRequestInterface<TicketDTO>> {
    try {
      const result = await APIClient.post<TicketDTO>(ENDPOINT, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao criar ticket") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async listTickets(params?: Pick<PaginationParams, "limit" | "offset">): Promise<ServiceRequestInterface<TicketDTO[]>> {
    try {
      const result = await APIClient.get<TicketDTO[]>(ENDPOINT, params);
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async listTicketsByProject(projectId: string): Promise<ServiceRequestInterface<TicketDTO[]>> {
    try {
      const result = await APIClient.get<TicketDTO[]>(`${ENDPOINT}/project/${projectId}`);
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async updateTicket(id: string, data: TicketUpdate): Promise<ServiceRequestInterface<TicketDTO>> {
    try {
      const result = await APIClient.put<TicketDTO>(`${ENDPOINT}/${id}`, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao atualizar ticket") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async deleteTicket(id: string): Promise<ServiceRequestInterface<TicketDTO>> {
    try {
      const result = await APIClient.delete<TicketDTO>(`${ENDPOINT}/${id}`);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao excluir ticket") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async countByProjects(projectIds: string[]): Promise<ServiceRequestInterface<{ counts: Record<string, Record<string, number>> }>> {
    try {
      const result = await APIClient.get<{ counts: Record<string, Record<string, number>> }>(`${ENDPOINT}/counts`, {
        projectIds: projectIds.join(","),
      });
      return { success: true, data: result ?? { counts: {} }, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const ticketService = new TicketService();
