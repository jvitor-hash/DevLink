import { PRIORITY_ACCENT_CLASS, PRIORITY_LABEL } from "../types/ticket_board";
import { ArrowLeft, ArrowRight, Trash2 } from "react-feather";

export function TicketCard({ ticket, meta, canMoveLeft = false, canMoveRight = false, onMoveLeft, onMoveRight, onDelete, onClick }) {
  const accentClass = PRIORITY_ACCENT_CLASS[meta.priority] || "border-l-(--border)";

  return (
    <div
      onClick={onClick}
      className={`
        p-3 bg-(--surface-1) border border-(--border-subtle) 
        border-l-4 ${accentClass} flex flex-col gap-2 
        hover:border-(--primary)/40 transition-colors 
        cursor-pointer group shadow-xs
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm text-(--text-primary) line-clamp-2">
          {ticket.title}
        </h4>
        {onDelete && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 text-(--text-muted) hover:text-(--error) transition-opacity p-0.5 cursor-pointer"
            title="Excluir ticket"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {ticket.description && (
        <p className="text-xs text-(--text-secondary) line-clamp-2">
          {ticket.description}
        </p>
      )}

      {meta.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {meta.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-(--surface-2) text-(--text-muted)">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-(--border-subtle)/50 mt-1">
        <span className="text-[10px] text-(--text-muted)">
          Prioridade: {PRIORITY_LABEL[meta.priority]}
        </span>

        <div className="flex items-center gap-1">
          {canMoveLeft && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onMoveLeft?.(); }}
              className="p-1 text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
              title="Mover para esquerda"
            >
              <ArrowLeft size={12} />
            </button>
          )}
          {canMoveRight && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onMoveRight?.(); }}
              className="p-1 text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
              title="Mover para direita"
            >
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
