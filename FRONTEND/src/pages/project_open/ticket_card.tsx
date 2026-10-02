import { ChevronLeft, ChevronRight, Tag } from "react-feather";

import type { TicketDTO, TicketStatus } from "@/data/types/database";
import { PRIORITY_ACCENT_CLASS, PRIORITY_LABEL, tagChipClass, type TicketMeta } from "./ticket_board";

type TicketCardProps = {
  ticket: TicketDTO;
  meta: TicketMeta;
  isDragging: boolean;
  moveBackTo: TicketStatus | null;
  moveForwardTo: TicketStatus | null;
  onOpen: (ticket: TicketDTO) => void;
  onMove: (ticket: TicketDTO, status: TicketStatus) => void;
  onDragStart: (event: React.DragEvent<HTMLElement>, ticket: TicketDTO) => void;
  onDragEnd: () => void;
  onDragOver: (event: React.DragEvent<HTMLElement>, ticket: TicketDTO) => void;
};

export default function TicketCard({
  ticket,
  meta,
  isDragging,
  moveBackTo,
  moveForwardTo,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
  onDragOver,
}: TicketCardProps) {
  const description = ticket.description?.trim() ?? "";

  return (
    <article
      draggable
      data-testid={`ticket-card-${ticket.id}`}
      aria-label={ticket.title}
      onDragStart={(event) => onDragStart(event, ticket)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => onDragOver(event, ticket)}
      onClick={() => onOpen(ticket)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(ticket);
        }
      }}
      tabIndex={0}
      className={`group cursor-grab rounded-md border border-(--border-subtle) border-l-4 bg-(--surface-1) p-2.5 text-left transition-all hover:border-(--primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) active:cursor-grabbing ${PRIORITY_ACCENT_CLASS[meta.priority]} ${isDragging ? "opacity-40" : ""}`}
    >
      <header className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-(--text-primary)">{ticket.title}</p>

        <span className="shrink-0 rounded bg-(--surface-3) px-1.5 py-0.5 text-[10px] uppercase text-(--text-muted)">
          {PRIORITY_LABEL[meta.priority]}
        </span>
      </header>

      {description.length > 0 && (
        <p className="mt-1 line-clamp-2 text-xs text-(--text-secondary)">{description}</p>
      )}

      {meta.tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1">
          {meta.tags.map((tag) => (
            <li
              key={tag}
              className={`rounded border px-1.5 py-0.5 text-[10px] ${tagChipClass(tag)}`}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-2 flex items-center justify-between gap-2 border-t border-(--border-subtle) pt-2">
        <span className="flex items-center gap-1 text-[10px] text-(--text-muted)">
          {meta.tags.length > 0 && <Tag size={10} />}
          {ticket.assigneeId ? "Atribuído" : "Sem responsável"}
        </span>

        {/* Keyboard equivalent of dragging, since drag and drop is pointer-only. */}
        <span className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            aria-label={`Mover "${ticket.title}" para a coluna anterior`}
            disabled={moveBackTo === null}
            onClick={(event) => {
              event.stopPropagation();
              if (moveBackTo !== null) onMove(ticket, moveBackTo);
            }}
            className="rounded p-0.5 text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={12} />
          </button>

          <button
            type="button"
            aria-label={`Mover "${ticket.title}" para a próxima coluna`}
            disabled={moveForwardTo === null}
            onClick={(event) => {
              event.stopPropagation();
              if (moveForwardTo !== null) onMove(ticket, moveForwardTo);
            }}
            className="rounded p-0.5 text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={12} />
          </button>
        </span>
      </footer>
    </article>
  );
}
