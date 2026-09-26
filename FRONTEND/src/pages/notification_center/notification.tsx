import { useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { notificationService } from "@/data/services/notification_service";
import { savedTicketService } from "@/data/services/saved_ticket_service";
import { userSingleton } from "@/context/user";
import Button from "@/components/ui/button_component";
import NotificationListItem from "@/components/ui/notification_list_item";
import type { NotificationDTO } from "@/data/types/database";
import { formatRelativeTime } from "@/utils/time_formatting";
import { useNotifications } from "@/hooks/use_notifications";

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

export async function NotificationLoader(): Promise<{
  items: NotificationDTO[];
  savedProjectIds: string[];
}> {
  const pageSize = 100;
  const items: NotificationDTO[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const page = await notificationService.list({ limit: pageSize, offset });
    if (!Array.isArray(page) || page.length === 0) break;
    items.push(...page);
    if (page.length < pageSize) break;
  }

  const user = userSingleton.getCachedUser();
  const savedProjectIds = user
    ? (await savedTicketService.getSavedProjectIdsByUser(user.id)).savedProjectIds
    : [];

  return { items, savedProjectIds };
}

export default function NotificationPage() {
  const loaderData = useLoaderData<typeof NotificationLoader>();
  const navigate = useNavigate();

  // The hook is the single source of truth: loader rows seed it, the socket
  // pushes live updates and REST refresh covers disconnect gaps.
  const { notifications, unreadCount, isConnected, markAsRead, setArchived } =
    useNotifications(100, loaderData.items);

  const [category, setCategory] = useState<Category>("RECENTS");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(loaderData.savedProjectIds ?? []);

  const markAllAsRead = async (): Promise<void> => {
    const unread = notifications.filter(
      (item) => !item.isRead && !isOld(item.createdAt),
    );

    if (!unread.length) return;

    await Promise.allSettled(unread.map((item) => markAsRead(item.id)));
  };

  const archive = async (item: NotificationDTO): Promise<void> => {
    await setArchived(item.id, true);

    setSelectedId((prev) => (prev === item.id ? null : prev));
  };

  const unarchive = async (item: NotificationDTO): Promise<void> => {
    await setArchived(item.id, false);
  };

  const saveProjectFromNotification = async (projectId: string): Promise<void> => {
    if (savedIds.includes(projectId)) return;

    // Saving is a programmer-only action; the API rejects everyone else.
    if (userSingleton.getCachedUser()?.role !== "PROGRAMMER") return;

    try {
      await savedTicketService.create({ projectId });
      setSavedIds((prev) => [...prev, projectId]);
    } catch {
      // Ignore save failures.
    }
  };

  const filtered = useMemo((): NotificationDTO[] => {
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

  const selected = notifications.find((item) => item.id === selectedId) ?? null;
  const selectedProjectId = selected ? selected.projectId : null;

  const categoryCount = (key: Category): number => {
    switch (key) {
      case "RECENTS": return unreadCount;
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
          <div className="flex items-center gap-2">
            <h2 className="text-lg">{CATEGORIES.find((c) => c.key === category)?.label}</h2>
            {!isConnected && <span className="text-xs text-(--text-muted)">reconectando…</span>}
          </div>

          <Button
            label="Marcar todas lidas"
            buttonType="button"
            colorType="secondary"
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-(--text-muted) py-6 text-center">Nenhuma notificação nesta categoria.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((item) => (
              <li key={item.id}>
                <NotificationListItem
                  notification={item}
                  selected={selectedId === item.id}
                  onSelect={(selectedItem) => {
                    setSelectedId(selectedItem.id);
                    if (!selectedItem.isRead) void markAsRead(selectedItem.id);
                  }}
                  onArchive={(archivedItem) => void archive(archivedItem)}
                  onUnarchive={(unarchivedItem) => void unarchive(unarchivedItem)}
                />
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
                {userSingleton.getCachedUser()?.role === "PROGRAMMER" && (
                  <Button
                    label={savedIds.includes(selectedProjectId) ? "Salvo" : "Salvar projeto"}
                    buttonType="button"
                    colorType="secondary"
                    disabled={savedIds.includes(selectedProjectId)}
                    onClick={() => saveProjectFromNotification(selectedProjectId)}
                  />
                )}
                <Button
                  label={selected.archived ? "Desarquivar" : "Arquivar"}
                  buttonType="button"
                  colorType="secondary"
                  onClick={() => (selected.archived ? void unarchive(selected) : void archive(selected))}
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
