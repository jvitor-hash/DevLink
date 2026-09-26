import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "react-feather";
import { useNotifications } from "@/hooks/use_notifications";
import NotificationListItem from "@/components/ui/notification_list_item";

export default function NotificationBell() {
  const [open, setOpen] = useState<boolean>(false);
  const { notifications, unreadCount, isConnected, markAsRead, setArchived, refresh } = useNotifications(25);

  // Archived rows disappear from the bell; they remain available on the full page.
  const recent = notifications.filter((item) => !item.archived);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Live updates arrive via /ws/notifications; REST refresh covers disconnect gaps.
  const toggleMenu = (): void => {
    const next = !open;
    setOpen(next);
    if (next) void refresh();
  };

  const openFullPage = (): void => {
    setOpen(false);
    navigate("/notification");
  };

  return (
    <div className="relative" ref={containerRef}>      <button type="button" className="relative hover:cursor-pointer" onClick={toggleMenu} data-testid="notification-bell">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-(--error)" />
        )}
      </button>

      <div
        className={`absolute right-0 mt-3 w-80 rounded-md border border-(--border-subtle) bg-(--surface-1) shadow-lg z-50 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--border-subtle)">
          <p className="font-semibold">Notificações</p>
          {!isConnected && <span className="text-xs text-(--text-muted)">reconectando…</span>}
          <button type="button" className="text-sm text-(--info) hover:underline" onClick={openFullPage}>
            Ver todas
          </button>
        </div>

        <ul className="max-h-80 overflow-y-auto">
          {recent.length === 0 ? (
            <li className="px-4 py-6 text-center text-(--text-muted)">Nenhuma notificacao</li>
          ) : (            recent.map((item) => (
              <li key={item.id} className="px-4 py-3 border-b border-(--border-subtle) last:border-b-0">
                <NotificationListItem
                  notification={item}
                  onSelect={() => void markAsRead(item.id)}
                  onArchive={(archivedItem) => void setArchived(archivedItem.id, true)}
                />
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
