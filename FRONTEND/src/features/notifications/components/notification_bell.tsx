import { useState } from "react";
import { ULIB } from "@/shared/ui";
import { NotificationItem } from "./notification_item";
import { useNotifications } from "../hooks/use_notifications";
import { Bell, Check } from "react-feather";
import { useRedirect } from "@/shared/hooks/use_redirect";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, toggleArchive } =
    useNotifications();
  const redirect = useRedirect();

  const previewNotifications = notifications.slice(0, 10);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative p-2 text-(--text-secondary) hover:text-(--text-primary) cursor-pointer"
        aria-label="Abrir notificações"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-(--primary) text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <ULIB.drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Notificações"
        placement="right"
      >
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-(--border-subtle) flex items-center justify-between">
            <span className="text-xs text-(--text-muted)">
              {unreadCount} não lida{unreadCount === 1 ? "" : "s"}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-(--primary) hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Check size={14} /> Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {previewNotifications.length === 0 ? (
              <p className="p-6 text-sm text-(--text-muted) italic text-center">
                Nenhuma notificação no momento.
              </p>
            ) : (
              previewNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkAsRead={markAsRead}
                  onToggleArchive={toggleArchive}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.projectId) {
                      setOpen(false);
                      redirect(`/project/open/${n.projectId}`);
                    }
                  }}
                />
              ))
            )}
          </div>

          <div className="p-3 border-t border-(--border-subtle) text-center">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                redirect("/notification");
              }}
              className="text-xs text-(--text-primary) hover:underline cursor-pointer font-medium"
            >
              Ver todas as notificações &rarr;
            </button>
          </div>
        </div>
      </ULIB.drawer>
    </>
  );
}
