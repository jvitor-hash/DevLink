import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notification_service";
import { savedTicketService } from "@/services/saved_ticket_service";
import { authService } from "@/services/auth_service";
import type { NotificationDTO } from "@/lib/types/database";

type Category = "RECENTS" | "SAVED" | "ARCHIVES" | "OLD";

const CATEGORIES: Array<{ key: Category; label: string }> = [
  { key: "RECENTS", label: "Recentes" },
  { key: "SAVED", label: "Salvos" },
  { key: "ARCHIVES", label: "Arquivados" },
  { key: "OLD", label: "Antigos" },
];

const isOld = (createdAt: string | Date | null | undefined): boolean => {
  if (!createdAt) return false;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() > 30 * 86_400_000;
};

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationDTO[] | null>(null);
  const [category, setCategory] = useState<Category>("RECENTS");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const items: NotificationDTO[] = [];
        const pageSize = 100;

        for (let offset = 0; ; offset += pageSize) {
          const page = await notificationService.list({ limit: pageSize, offset });
          if (!Array.isArray(page) || page.length === 0) break;
          items.push(...page);
          if (page.length < pageSize) break;
        }

        setNotifications(items);

        const user = authService.getCachedUser();
        if (user) {
          const { savedProjectIds } = await savedTicketService.getSavedProjectIdsByUser(user.id);
          setSavedIds(savedProjectIds ?? []);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar as notificacoes.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const markAsRead = async (item: NotificationDTO): Promise<void> => {
    setSelectedId(item.id);

    if (item.isRead) return;

    try {
      await notificationService.update(item.id, { isRead: true });
      setNotifications((prev) =>
        prev ? prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)) : prev
      );
    } catch {
      // Keep local unread state; it will sync on next load.
    }
  };

  const archive = async (item: NotificationDTO): Promise<void> => {
    try {
      await notificationService.update(item.id, { type: "SYSTEM", title: item.title, message: item.message });
      setNotifications((prev) => (prev ? prev.filter((n) => n.id !== item.id) : prev));
      if (selectedId === item.id) setSelectedId(null);
    } catch {
      // Ignore archive failures; the item stays in the list.
    }
  };

  const saveProjectFromNotification = async (projectId: string): Promise<void> => {
    if (savedIds.includes(projectId)) return;

    try {
      await savedTicketService.create({ projectId, userId: "" });
      setSavedIds((prev) => [...prev, projectId]);
    } catch {
      // Ignore save failures.
    }
  };

  const filtered = useMemo((): NotificationDTO[] => {
    if (!notifications) return [];

    switch (category) {
      case "RECENTS":
        return notifications.filter((item) => !item.isRead && !isOld(item.createdAt));
      case "SAVED":
        return notifications.filter((item) => item.projectId != null && savedIds.includes(item.projectId));
      case "ARCHIVES":
        return notifications.filter((item) => item.isRead && !isOld(item.createdAt));
      default:
        return notifications.filter((item) => isOld(item.createdAt));
    }
  }, [notifications, category, savedIds]);

  const selected = notifications?.find((item) => item.id === selectedId) ?? null;
  const selectedProjectId = selected ? selected.projectId : null;

  const categoryCount = (key: Category): number => {
    if (!notifications) return 0;
    switch (key) {
      case "RECENTS": return notifications.filter((item) => !item.isRead && !isOld(item.createdAt)).length;
      case "SAVED": return notifications.filter((item) => item.projectId != null && savedIds.includes(item.projectId)).length;
      case "ARCHIVES": return notifications.filter((item) => item.isRead && !isOld(item.createdAt)).length;
      default: return notifications.filter((item) => isOld(item.createdAt)).length;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-(--text-muted)">Carregando notificacoes...</div>;
  }

  if (error) {
    return <div className="p-8 text-(--error)">{error}</div>;
  }

  return (
    <div className="flex mx-4 mt-4 gap-4 min-h-[70vh]">
      {/* Category sidebar */}
      <aside className="w-56 shrink-0 rounded-md border border-(--border-subtle) bg-(--surface-1) p-4">
        <h1 className="text-xl mb-4">Notificacoes</h1>
        <nav className="flex flex-col gap-1">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`flex items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors hover:cursor-pointer ${
                category === key ? "bg-(--primary) text-white" : "text-(--text-secondary) hover:bg-(--surface-2)"
              }`}
            >
              {label}
              <span className="text-xs text-(--text-muted)">{categoryCount(key)}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Notification list */}
      <section className="flex-1 rounded-md border border-(--border-subtle) bg-(--surface-1) p-4 overflow-y-auto">
        <h2 className="text-lg mb-3">{CATEGORIES.find((c) => c.key === category)?.label}</h2>

        {filtered.length === 0 ? (
          <p className="text-(--text-muted) py-6 text-center">Nenhuma notificacao nesta categoria.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => markAsRead(item)}
                  className={`w-full text-left rounded border px-4 py-3 transition-colors hover:cursor-pointer ${
                    selectedId === item.id ? "border-(--primary)" : "border-(--border-subtle)"
                  } ${item.isRead ? "bg-(--surface-2) opacity-80" : "bg-(--surface-2)"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${item.isRead ? "text-(--text-muted)" : "text-white font-semibold"}`}>
                      {item.title}
                    </p>
                    {!item.isRead && <span className="w-2 h-2 rounded-full bg-(--error)" />}
                  </div>
                  <p className="text-xs text-(--text-muted) mt-1 line-clamp-2">{item.message}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Detail pane */}
      <section className="flex-1 rounded-md border border-(--border-subtle) bg-(--surface-1) p-4 overflow-y-auto">
        {selected ? (
          <>
            <h2 className="text-lg font-semibold">{selected.title}</h2>
            <p className="text-sm text-(--text-muted) mt-1">{String(selected.createdAt ?? "")}</p>
            <p className="text-(--text-secondary) mt-4 whitespace-pre-wrap">{selected.message}</p>

            {selectedProjectId && (
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full px-4 py-1.5 bg-(--primary) text-white hover:cursor-pointer"
                  onClick={() => navigate(`/project?modal=project&id=${encodeURIComponent(selectedProjectId)}`)}
                >
                  Ver projeto
                </button>
                <button
                  type="button"
                  className="rounded-full px-4 py-1.5 bg-(--secondary) text-white hover:cursor-pointer disabled:opacity-50"
                  disabled={savedIds.includes(selectedProjectId)}
                  onClick={() => saveProjectFromNotification(selectedProjectId)}
                >
                  {savedIds.includes(selectedProjectId) ? "Salvo" : "Salvar projeto"}
                </button>
                <button
                  type="button"
                  className="rounded-full px-4 py-1.5 border border-(--border-subtle) text-(--text-secondary) hover:cursor-pointer"
                  onClick={() => archive(selected)}
                >
                  Arquivar
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-(--text-muted)">Selecione uma notificacao para ver os detalhes.</p>
        )}
      </section>
    </div>
  );
}
