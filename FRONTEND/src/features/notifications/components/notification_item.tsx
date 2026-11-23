import type { NotificationDTO } from "@/shared/types/database";
import { Check, Archive, MessageSquare, Briefcase, Star, Bell } from "react-feather";

interface NotificationItemProps {
  notification: NotificationDTO;
  onMarkAsRead?: (id: string) => void;
  onToggleArchive?: (notification: NotificationDTO) => void;
  onClick?: () => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onToggleArchive,
  onClick,
}: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "NEW_MESSAGE":
        return <MessageSquare size={16} className="text-(--info)" />;
      case "NEW_PROJECT":
      case "PROJECT_UPDATE":
        return <Briefcase size={16} className="text-(--primary)" />;
      case "NEW_REVIEW":
        return <Star size={16} className="text-(--warning)" />;
      default:
        return <Bell size={16} className="text-(--text-muted)" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 border-b border-(--border-subtle) flex items-start gap-3 transition-colors ${
        notification.isRead ? "bg-(--surface-1) opacity-80" : "bg-(--surface-2)/40 font-medium"
      } hover:bg-(--surface-2) cursor-pointer group`}
    >
      <div className="mt-0.5 shrink-0">{getIcon()}</div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm text-(--text-primary) truncate">{notification.title}</h4>
          {notification.createdAt && (
            <span className="text-[10px] text-(--text-muted) shrink-0">
              {new Date(notification.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <p className="text-xs text-(--text-secondary) leading-relaxed">{notification.message}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!notification.isRead && onMarkAsRead && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="p-1 text-(--text-muted) hover:text-(--success) cursor-pointer"
            title="Marcar como lida"
          >
            <Check size={14} />
          </button>
        )}

        {onToggleArchive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchive(notification);
            }}
            className="p-1 text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
            title={notification.archived ? "Desarquivar" : "Arquivar"}
          >
            <Archive size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
