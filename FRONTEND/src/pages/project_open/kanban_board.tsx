import { useMemo, useState } from "react";
import { Search, X } from "react-feather";

import type { TicketDTO, TicketStatus } from "@/data/types/database";
import Button from "@/components/ui/button_component";
import TicketCard from "./ticket_card";
import {
  COLUMNS,
  countByStatus,
  matchesTicketQuery,
  nextStatus,
  orderTickets,
  previousStatus,
  tagChipClass,
  type TicketMeta,
  type TicketMetaMap,
} from "./ticket_board";

type DropHint = { status: TicketStatus; beforeId: string | null };

type KanbanBoardProps = {
  tickets: TicketDTO[];
  metaMap: TicketMetaMap;
  getMeta: (ticketId: string) => TicketMeta;
  onOpenTicket: (ticket: TicketDTO) => void;
  onCreateTicket: (status: TicketStatus) => void;
  onMove: (ticketId: string, status: TicketStatus, beforeId: string | null) => void;
};

export default function KanbanBoard({
  tickets,
  metaMap,
  getMeta,
  onOpenTicket,
  onCreateTicket,
  onMove,
}: KanbanBoardProps) {
  const [query, setQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<DropHint | null>(null);

  const counts = useMemo(() => countByStatus(tickets), [tickets]);

  const availableTags = useMemo(() => {
    const found = new Set<string>();

    for (const ticket of tickets) {
      for (const tag of getMeta(ticket.id).tags) found.add(tag);
    }

    return [...found].sort((a, b) => a.localeCompare(b));
  }, [tickets, getMeta]);

  const visibleTickets = useMemo(
    () => tickets.filter((ticket) => matchesTicketQuery(ticket, query, selectedTags, metaMap)),
    [tickets, query, selectedTags, metaMap],
  );

  const columns = useMemo(
    () => COLUMNS.map((column) => ({
      ...column,
      total: counts[column.status],
      tickets: orderTickets(visibleTickets.filter((ticket) => ticket.status === column.status)),
    })),
    [visibleTickets, counts],
  );

  const toggleTag = (tag: string): void => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const handleDragStart = (event: React.DragEvent<HTMLElement>, ticket: TicketDTO): void => {
    setDraggingId(ticket.id);
    setDropHint(null);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", ticket.id);
  };

  const handleDragEnd = (): void => {
    setDraggingId(null);
    setDropHint(null);
  };

  // Hovering a card resolves to the insertion slot next to it, so the hint line
  // lands where the card would actually drop.
  const handleCardDragOver = (
    event: React.DragEvent<HTMLElement>,
    ticket: TicketDTO,
    columnTickets: TicketDTO[],
  ): void => {
    event.preventDefault();
    event.stopPropagation();

    if (!draggingId || draggingId === ticket.id) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const isLowerHalf = event.clientY > bounds.top + bounds.height / 2;

    if (!isLowerHalf) {
      setDropHint({ status: ticket.status, beforeId: ticket.id });
      return;
    }

    const remaining = columnTickets.filter((row) => row.id !== draggingId);
    const anchor = remaining.findIndex((row) => row.id === ticket.id);
    const follower = anchor >= 0 ? remaining[anchor + 1] : undefined;

    setDropHint({ status: ticket.status, beforeId: follower ? follower.id : null });
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>, status: TicketStatus, beforeId: string | null): void => {
    event.preventDefault();

    const ticketId = draggingId ?? event.dataTransfer.getData("text/plain");

    if (ticketId) onMove(ticketId, status, beforeId);

    handleDragEnd();
  };

  const isFiltering = query.trim().length > 0 || selectedTags.length > 0;

  return (
    <section aria-label="Quadro de tarefas" className="flex flex-1 flex-col gap-3">
      <header className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-45 flex-1">
          <Search size={14} className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-(--text-muted)" />

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrar por título, descrição ou tag..."
            aria-label="Filtrar cartões"
            data-testid="board-filter-input"
            className="w-full rounded border border-(--border-subtle) bg-(--surface-2) py-1.5 pr-2 pl-7 text-sm outline-none focus:border-(--primary)"
          />
        </div>

        <Button
          label="Novo cartão"
          buttonType="button"
          colorType="primary"
          dataTestId="board-add-ticket-global"
          onClick={() => onCreateTicket(COLUMNS[0].status)}
          className="py-1 text-xs"
        />

        {availableTags.length > 0 && (
          <ul className="flex flex-wrap items-center gap-1" aria-label="Filtrar por tag">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);

              return (
                <li key={tag}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleTag(tag)}
                    className={`rounded border px-1.5 py-0.5 text-[10px] transition-colors hover:cursor-pointer ${tagChipClass(tag)} ${isSelected ? "ring-1 ring-(--primary)" : "opacity-70"}`}
                  >
                    {tag}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {isFiltering && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedTags([]);
            }}
            className="flex items-center gap-1 text-xs text-(--text-muted) hover:cursor-pointer hover:text-(--text-primary)"
          >
            <X size={12} /> Limpar
          </button>
        )}
      </header>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((column) => {
          const isDropTarget = dropHint?.status === column.status;

          return (
            <section
              key={column.status}
              aria-label={column.label}
              data-testid={`board-column-${column.status}`}
              onDragOver={(event) => {
                event.preventDefault();

                if (draggingId) setDropHint({ status: column.status, beforeId: null });
              }}
              onDragLeave={(event) => {
                // Moving between cards inside the column also fires dragleave.
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                if (dropHint?.status === column.status) setDropHint(null);
              }}
              onDrop={(event) => handleDrop(event, column.status, isDropTarget ? dropHint.beforeId : null)}
              className={`flex min-w-55 flex-1 flex-col gap-2 rounded-md border bg-(--surface-2) p-2.5 transition-colors ${isDropTarget ? "border-(--primary)" : "border-(--border-subtle)"}`}
            >
              <header className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-(--text-primary)">{column.label}</p>
                  <p className="truncate text-[10px] text-(--text-muted)">{column.hint}</p>
                </div>

                <span className="rounded-full bg-(--surface-3) px-2 py-0.5 text-[10px] text-(--text-muted)">
                  {column.total}
                </span>
              </header>

              <div className="flex min-h-16 flex-1 flex-col gap-2">
                {column.tickets.map((ticket) => (
                  <div key={ticket.id} className={isDropTarget && dropHint.beforeId === ticket.id ? "border-t-2 border-(--primary)" : ""}>
                    <TicketCard
                      ticket={ticket}
                      meta={getMeta(ticket.id)}
                      isDragging={draggingId === ticket.id}
                      moveBackTo={previousStatus(ticket.status)}
                      moveForwardTo={nextStatus(ticket.status)}
                      onOpen={onOpenTicket}
                      onMove={(moved, status) => onMove(moved.id, status, null)}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={(event, hovered) => handleCardDragOver(event, hovered, column.tickets)}
                    />
                  </div>
                ))}

                {column.tickets.length === 0 && (
                  <p className="rounded border border-dashed border-(--border-subtle) px-2 py-4 text-center text-[11px] text-(--text-muted)">
                    {isDropTarget ? "Solte aqui" : "Nenhum cartão"}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
