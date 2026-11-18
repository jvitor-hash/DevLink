import { useState, useEffect, useCallback } from "react";
import { ticketService } from "../service/ticket_service";
import type { TicketDTO, TicketCreate, TicketUpdate, TicketStatus } from "@/shared/types/database";
import { orderTickets } from "../types/ticket_board";
import { toast } from "@/shared/utils/toast_store";

export function useTickets(projectId: string) {
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    const result = await ticketService.listTicketsByProject(projectId);
    if (result.success && result.data) {
      setTickets(orderTickets(result.data));
    } else {
      setError(result.errors?.message || "Falha ao carregar tickets.");
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const addTicket = useCallback(async (data: TicketCreate) => {
    const result = await ticketService.createTicket(data);
    if (result.success && result.data) {
      setTickets((prev) => orderTickets([...prev, result.data!]));
      toast.success("Ticket criado com sucesso!");
      return result.data;
    } else {
      toast.error("Falha ao criar ticket.");
      return null;
    }
  }, []);

  const updateTicketData = useCallback(async (id: string, data: TicketUpdate) => {
    const result = await ticketService.updateTicket(id, data);
    if (result.success && result.data) {
      setTickets((prev) =>
        orderTickets(prev.map((t) => (t.id === id ? { ...t, ...result.data } : t)))
      );
      toast.success("Ticket atualizado!");
      return result.data;
    } else {
      toast.error("Falha ao atualizar ticket.");
      return null;
    }
  }, []);

  const moveTicket = useCallback(async (ticketId: string, targetStatus: TicketStatus) => {
    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: targetStatus } : t))
    );

    const result = await ticketService.updateTicket(ticketId, { status: targetStatus });
    if (!result.success) {
      toast.error("Erro ao mover ticket.");
      fetchTickets();
    }
  }, [fetchTickets]);

  const removeTicket = useCallback(async (id: string) => {
    const result = await ticketService.deleteTicket(id);
    if (result.success) {
      setTickets((prev) => prev.filter((t) => t.id !== id));
      toast.info("Ticket removido.");
      return true;
    } else {
      toast.error("Falha ao remover ticket.");
      return false;
    }
  }, []);

  return {
    tickets,
    loading,
    error,
    addTicket,
    updateTicket: updateTicketData,
    moveTicket,
    removeTicket,
    refetch: fetchTickets,
  };
}
