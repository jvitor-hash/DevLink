import { TicketCard } from "./ticket_card";
import { Plus } from "react-feather";


export function TicketColumn({ status, label, hint,
  tickets,
  metaMap,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onDeleteTicket,
  onSelectTicket,
  onAddTicket,
}) {
  return (
    <div className="flex-1 min-w-[260px] bg-(--surface-2)/40 border border-(--border-subtle) flex flex-col max-h-[700px]">
      <div className="p-3 border-b border-(--border-subtle) flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm text-(--text-primary)">{label}</h3>
            <span className="text-xs px-1.5 py-0.2 bg-(--surface-1) border border-(--border-subtle) font-mono">
              {tickets.length}
            </span>
          </div>
          <span className="text-[11px] text-(--text-muted)">{hint}</span>
        </div>

        {onAddTicket && (
          <button
            type="button"
            onClick={() => onAddTicket(status)}
            className="p-1 rounded hover:bg-(--surface-1) text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
            title={`Adicionar ticket em ${label}`}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="p-2 flex flex-col gap-2 overflow-y-auto flex-1">
        {tickets.length === 0 && (
          <div className="py-8 text-center text-xs text-(--text-muted) italic">Nenhum ticket</div>
        )}

        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            meta={metaMap[ticket.id] ?? { tags: [], priority: "MEDIUM" }}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            onMoveLeft={() => onMoveLeft(ticket.id)}
            onMoveRight={() => onMoveRight(ticket.id)}
            onDelete={() => onDeleteTicket(ticket.id)}
            onClick={() => onSelectTicket?.(ticket)}
          />
        ))}
      </div>
    </div>
  );
}
