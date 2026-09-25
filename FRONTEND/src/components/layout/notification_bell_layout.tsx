import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "react-feather";
import { formatTime } from "@/lib/utils/time_formatting";
import { useNotifications } from "@/lib/hooks/use_notifications";

export default function NotificationBell() {
  const [open, setOpen] = useState<boolean>(false);
  const { notifications: recent, unreadCount, isConnected, markAsRead, refresh } = useNotifications();
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
          ) : (
            recent.map((item) => (
              <li key={item.id} className="px-4 py-3 border-b border-(--border-subtle) last:border-b-0">
                <button
                  type="button"
                  onClick={() => void markAsRead(item.id)}
                  className="w-full text-left hover:cursor-pointer"
                >
                  <p className={`text-sm ${item.isRead ? "text-(--text-muted)" : "text-white font-semibold"}`}>
                    {!item.isRead && <span className="mr-1 inline-block h-2 w-2 rounded-full bg-(--error)" />}
                    {item.title}
                  </p>
                  <p className="text-xs text-(--text-muted) line-clamp-2">{item.message}</p>
                  <p className="text-xs text-(--text-disabled) mt-1">{formatTime(item.createdAt)}</p>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
