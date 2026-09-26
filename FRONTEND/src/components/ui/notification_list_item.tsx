import { Archive, RotateCcw } from "react-feather";
import type { NotificationDTO } from "@/data/types/database";
import { formatRelativeTime } from "@/utils/time_formatting";

interface NotificationListItemProps {
  notification: NotificationDTO;
  selected?: boolean;
  onSelect: (notification: NotificationDTO) => void;
  onArchive?: (notification: NotificationDTO) => void;
  onUnarchive?: (notification: NotificationDTO) => void;
}

export default function NotificationListItem({ notification, selected = false, onSelect, onArchive, onUnarchive }: NotificationListItemProps) {
  const { isRead, archived, title, message, createdAt } = notification;

  return (
    <div
      className={`flex w-full items-start gap-2 rounded border px-4 py-3 ${selected ? "border-(--primary)" : "border-(--border-subtle)"
        } ${isRead ? "bg-(--surface-2) opacity-80" : "border-(--info) bg-(--surface-2)"}`}
    >
      <button
        type="button"
        onClick={() => onSelect(notification)}
        className="min-w-0 flex-1 text-left hover:cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2">
          <p className={`flex items-center gap-2 text-sm ${isRead ? "text-(--text-muted)" : "font-semibold text-(--text-primary)"}`}>
            {!isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-(--error)" />}
            {title}
          </p>
          <span className="shrink-0 text-xs text-(--text-muted)">
            {formatRelativeTime(createdAt)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-(--text-muted)">{message}</p>
      </button>

      {onArchive && !archived && (
        <button
          type="button"
          aria-label="Arquivar"
          title="Arquivar"
          onClick={() => onArchive(notification)}
          className="shrink-0 rounded p-1 text-(--text-muted) transition-colors hover:bg-(--surface-1) hover:text-(--text-secondary) hover:cursor-pointer"
        >
          <Archive size={14} />
        </button>
      )}

      {onUnarchive && archived && (
        <button
          type="button"
          aria-label="Desarquivar"
          title="Desarquivar"
          onClick={() => onUnarchive(notification)}
          className="shrink-0 rounded p-1 text-(--text-muted) transition-colors hover:bg-(--surface-1) hover:text-(--text-secondary) hover:cursor-pointer"
        >
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  );
}
