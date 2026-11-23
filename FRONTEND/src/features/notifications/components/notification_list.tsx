import { useState } from "react";
import { ULIB } from "@/shared/ui";
import { NotificationItem } from "./notification_item";
import { useNotifications } from "../hooks/use_notifications";
import { useRedirect } from "@/shared/hooks/use_redirect";
import { Check } from "react-feather";

export function NotificationList() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, toggleArchive } =
    useNotifications();
  const [tab, setTab] = useState<"all" | "unread" | "archived">("all");
  const redirect = useRedirect();

  const filtered = notifications.filter((n) => {
    if (tab === "unread") return !n.isRead && !n.archived;
    if (tab === "archived") return n.archived;
    return !n.archived;
  });

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl border border-(--border) bg-(--surface-1) rounded-md overflow-hidden">
      <div className="p-4 border-b border-(--border-subtle) flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded cursor-pointer ${
              tab === "all" ? "bg-(--surface-2) text-(--text-primary)" : "text-(--text-muted)"
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setTab("unread")}
            className={`px-3 py-1.5 text-xs font-medium rounded cursor-pointer ${
              tab === "unread" ? "bg-(--surface-2) text-(--text-primary)" : "text-(--text-muted)"
            }`}
          >
            Não lidas ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setTab("archived")}
            className={`px-3 py-1.5 text-xs font-medium rounded cursor-pointer ${
              tab === "archived" ? "bg-(--surface-2) text-(--text-primary)" : "text-(--text-muted)"
            }`}
          >
            Arquivadas
          </button>
        </div>

        {unreadCount > 0 && (
          <ULIB.button
            tone="secondary"
            onClick={markAllAsRead}
            className="text-xs flex items-center gap-1.5"
          >
            <Check size={14} /> Marcar todas como lidas
          </ULIB.button>
        )}
      </div>

      <div className="flex flex-col">
        {loading && (
          <p className="p-8 text-center text-sm text-(--text-muted)">
            Carregando notificações...
          </p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-(--text-muted) italic">
            Nenhuma notificação nesta categoria.
          </p>
        )}

        {!loading &&
          filtered.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkAsRead={markAsRead}
              onToggleArchive={toggleArchive}
              onClick={() => {
                markAsRead(n.id);
                if (n.projectId) {
                  redirect(`/project/open/${n.projectId}`);
                }
              }}
            />
          ))}
      </div>
    </div>
  );
}
