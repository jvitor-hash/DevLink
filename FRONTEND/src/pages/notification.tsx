import { useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notification_service";
import { savedTicketService } from "@/services/saved_ticket_service";
import { authService } from "@/services/auth_service";
import Button from "@/components/ui/button_component";
import type { NotificationDTO } from "@/lib/types/database";
import { formatRelativeTime } from "@/lib/utils/relative_time";

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

export async function NotificationLoader() {
  const user = authService.getCachedUser();
  const items: NotificationDTO[] = [];
  const pageSize = 100;
  let savedProjectIds: string[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const page = await notificationService.list({ limit: pageSize, offset });
    if (!Array.isArray(page) || page.length === 0) break;
    items.push(...page);
    if (page.length < pageSize) break;
  }

  if (user) {
    const result = await savedTicketService.getSavedProjectIdsByUser(user.id);
    savedProjectIds = result.savedProjectIds;

    for (let offset = 0; ; offset += pageSize) {
      const page = await notificationService.list({ limit: pageSize, offset });
      if (!Array.isArray(page) || page.length === 0) break;
      items.push(...page);
      if (page.length < pageSize) break;
    }

    if (user)
      await savedTicketService.getSavedProjectIdsByUser(user.id)
  }

  return { items, pageSize, savedProjectIds }
};

export default function NotificationPage() {
  const loaderData = useLoaderData<typeof NotificationLoader>();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationDTO[] | null>(loaderData.items ?? []);
  const [category, setCategory] = useState<Category>("RECENTS");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(loaderData.savedProjectIds ?? []);

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

  const markAllAsRead = async (): Promise<void> => {
    const unread = (notifications ?? []).filter(
      (item) => !item.isRead && !isOld(item.createdAt),
    );

    if (!unread.length) return;

    const results = await Promise.allSettled(
      unread.map((item) => notificationService.update(item.id, { isRead: true })),
    );

    const succeededIds = new Set(
      results
        .map((result, index) => (result.status === "fulfilled" ? unread[index].id : null))
        .filter((id): id is string => id !== null),
    );

    setNotifications((prev) =>
      prev ? prev.map((n) => (succeededIds.has(n.id) ? { ...n, isRead: true } : n)) : prev,
    );
  };

  const archive = async (item: NotificationDTO): Promise<void> => {
    try {
      await notificationService.update(item.id, { type: "SYSTEM", title: item.title, message: item.message, archived: true });
      setNotifications((prev) => (prev ? prev.filter((n) => n.id !== item.id) : prev));
      if (selectedId === item.id) setSelectedId(null);
    } catch {
      // Ignore archive failures; the item stays in the list.
    }
  };

  const saveProjectFromNotification = async (projectId: string): Promise<void> => {
    if (savedIds.includes(projectId)) return;

    try {
      await savedTicketService.create({ projectId });
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
        return notifications.filter((item) => item.archived && !isOld(item.createdAt));
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
      case "ARCHIVES": return notifications.filter((item) => item.archived && !isOld(item.createdAt)).length;
      default: return notifications.filter((item) => isOld(item.createdAt)).length;
    }
  };

  return (
    <div className="mx-4 mt-4 grid min-h-[70vh] grid-cols-1 gap-4 lg:grid-cols-[240px_1fr_1fr]">
      {/* Category sidebar; horizontal chips on small screens */}
      <aside className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-4">
        <h1 className="mb-4 text-xl">Notificações</h1>
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`flex shrink-0 items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors hover:cursor-pointer ${category === key ? "bg-(--primary) text-white" : "text-(--text-secondary) hover:bg-(--surface-2)"
                }`}
            >
              {label}
              <span className="text-xs text-(--text-muted)">{categoryCount(key)}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Notification list */}
      <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-4 overflow-y-auto">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg">{CATEGORIES.find((c) => c.key === category)?.label}</h2>

          <Button
            label="Marcar todas lidas"
            buttonType="button"
            colorType="secondary"
            disabled={categoryCount("RECENTS") === 0}
            onClick={markAllAsRead}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-(--text-muted) py-6 text-center">Nenhuma notificação nesta categoria.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => markAsRead(item)}
                  className={`w-full rounded border px-4 py-3 text-left transition-colors hover:cursor-pointer ${selectedId === item.id ? "border-(--primary)" : "border-(--border-subtle)"
                    } ${item.isRead ? "bg-(--surface-2) opacity-80" : "border-(--info) bg-(--surface-2)"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`flex items-center gap-2 text-sm ${item.isRead ? "text-(--text-muted)" : "font-semibold text-(--text-primary)"}`}>
                      {!item.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-(--error)" />}
                      {item.title}
                    </p>
                    <span className="shrink-0 text-xs text-(--text-muted)">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-(--text-muted)">{item.message}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Detail pane */}
      <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-4 overflow-y-auto">
        {selected ? (
          <>
            <h2 className="text-lg font-semibold">{selected.title}</h2>
            <p className="mt-1 text-sm text-(--text-muted)">
              {formatRelativeTime(selected.createdAt) || String(selected.createdAt ?? "")}
            </p>
            <div className="mt-4 rounded border border-(--border-subtle) bg-(--surface-2) p-4">
              <p className="whitespace-pre-wrap text-(--text-secondary)">{selected.message}</p>
            </div>

            {selectedProjectId && (
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  label="Ver projeto"
                  buttonType="button"
                  colorType="primary"
                  onClick={() => navigate(`/project/open/${encodeURIComponent(selectedProjectId)}`)}
                />
                <Button
                  label={savedIds.includes(selectedProjectId) ? "Salvo" : "Salvar projeto"}
                  buttonType="button"
                  colorType="secondary"
                  disabled={savedIds.includes(selectedProjectId)}
                  onClick={() => saveProjectFromNotification(selectedProjectId)}
                />
                <Button
                  label="Arquivar"
                  buttonType="button"
                  colorType="secondary"
                  onClick={() => archive(selected)}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-(--text-muted)">Selecione uma notificação para ver os detalhes.</p>
        )}
      </section>
    </div>
  );
}
