import { useState, useMemo } from "react";
import { ULIB } from "@/shared/ui";
import { TicketColumn } from "./ticket_column";
import { TicketModal } from "./ticket_modal";
import { COLUMNS } from "../types/ticket_board";
import { useTickets } from "../hooks/use_tickets";
import { useTicketMetadata } from "../hooks/use_ticket_metadata";
import { Search, Plus } from "react-feather";

export function KanbanBoard({ projectId }) {
  const { tickets, loading, addTicket, updateTicket, moveTicket, removeTicket } = useTickets(projectId);
  const { metaMap, setMeta } = useTicketMetadata(projectId);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<any>("BACKLOG");
  const [editingTicket, setEditingTicket] = useState<any | null>(null);

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const term = searchQuery.toLowerCase();
    return tickets.filter((t) => {
      const meta = metaMap[t.id];
      const matchTitle = t.title.toLowerCase().includes(term);
      const matchDesc = (t.description ?? "").toLowerCase().includes(term);
      const matchTag = meta?.tags.some((tag) => tag.toLowerCase().includes(term));
      return matchTitle || matchDesc || matchTag;
    });
  }, [tickets, searchQuery, metaMap]);

  const handleOpenAdd = (status = "BACKLOG") => {
    setEditingTicket(null);
    setModalStatus(status);
    setModalOpen(true);
  };

  const handleOpenEdit = (ticket) => {
    setEditingTicket(ticket);
    setModalStatus(ticket.status);
    setModalOpen(true);
  };

  const handleSaveTicket = async (data: any, meta: any) => {
    if (editingTicket) {
      const updated = await updateTicket(editingTicket.id, data);
      if (updated) setMeta(updated.id, meta);
    } else {
      const created = await addTicket(data);
      if (created) setMeta(created.id, meta);
    }
  };

  const statusOrder = ["BACKLOG", "IN_PROGRESS", "REVIEW", "DONE"];

  const handleMoveLeft = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const currentIndex = statusOrder.indexOf(ticket.status);
    if (currentIndex > 0) {
      moveTicket(ticketId, statusOrder[currentIndex - 1]);
    }
  };

  const handleMoveRight = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const currentIndex = statusOrder.indexOf(ticket.status);
    if (currentIndex < statusOrder.length - 1) {
      moveTicket(ticketId, statusOrder[currentIndex + 1]);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-(--text-muted)">Carregando quadro...</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-72">
          <ULIB.input
            placeholder="Buscar tickets ou tags..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm"
            error={null}
          />
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)" />
        </div>

        <ULIB.button onClick={() => handleOpenAdd("BACKLOG")} className="flex items-center gap-1.5">
          <Plus size={16} /> Novo Ticket
        </ULIB.button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col, index) => {
          const columnTickets = filteredTickets.filter((t) => t.status === col.status);
          return (
            <TicketColumn
              key={col.status}
              status={col.status}
              label={col.label}
              hint={col.hint}
              tickets={columnTickets}
              metaMap={metaMap}
              canMoveLeft={index > 0}
              canMoveRight={index < COLUMNS.length - 1}
              onMoveLeft={handleMoveLeft}
              onMoveRight={handleMoveRight}
              onDeleteTicket={removeTicket}
              onSelectTicket={handleOpenEdit}
              onAddTicket={handleOpenAdd}
            />
          );
        })}
      </div>

      {modalOpen && (
        <TicketModal
          projectId={projectId}
          initialStatus={modalStatus}
          ticketToEdit={editingTicket}
          metaToEdit={editingTicket ? metaMap[editingTicket.id] : null}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveTicket}
        />
      )}
    </div>
  );
}
