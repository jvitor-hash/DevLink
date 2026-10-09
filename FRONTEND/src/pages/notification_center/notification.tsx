import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/button_component";
import NotificationListItem from "@/components/ui/notification_list_item";
import { formatRelativeTime } from "@/utils/time_formatting";
import { eventToNotification } from "@/utils/notification_mapper";
import { useProjectEvents } from "@/hooks/use_project_events";
import { useCurrentUser } from "@/hooks/use_current_user";
import { cache, CACHE_KEYS } from "@/utils/session_cache";
import type { NotificationDTO, ProjectEvent } from "@/data/types/database";

type Category = "RECENTS" | "SAVED" | "ARCHIVES" | "OLD";

const CATEGORIES: ReadonlyArray<{ key: Category; label: string }> = [
  { key: "RECENTS", label: "Recentes" },
  { key: "SAVED", label: "Salvos" },
  { key: "ARCHIVES", label: "Arquivados" },
  { key: "OLD", label: "Antigos" },
];

const OLD_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

const isOld = (createdAt: string | Date | null | undefined): boolean => {
  if (!createdAt) return false;

  const received = new Date(createdAt).getTime();

  return Number.isFinite(received) && Date.now() - received > OLD_AFTER_MS;
};

const matchesCategory = (notification: NotificationDTO, category: Category | null): boolean => {
  if (category === null) return true;
  if (category === "ARCHIVES") return notification.archived;
  if (notification.archived) return false;

  if (category === "SAVED") return notification.type === "TICKET_SAVED";
  if (category === "OLD") return isOld(notification.createdAt);

  return true;
};

const restoreIds = (key: string): Set<string> => new Set(cache.get<string[]>(key) ?? []);

const persistIds = (key: string, ids: Set<string>): void => {
  cache.set(key, [...ids]);
};

export default function NotificationPage() {
  const [category] = useState<Category | null>("RECENTS");
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => restoreIds(CACHE_KEYS.NOTIFICATION_READ_IDS));
  const [archivedIds, setArchivedIds] = useState<Set<string>>(() => restoreIds(CACHE_KEYS.NOTIFICATION_ARCHIVED_IDS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Live feed: every project event becomes a notification entry.
  const handleEvent = useCallback((event: ProjectEvent): void => {
    setEvents((current) => [event, ...current.filter((existing) => existing.id !== event.id)]);
  }, []);

  // The feed is scoped to the audience the API streams for the signed-in user,
  // so every event they are entitled to arrives here regardless of project.
  const user = useCurrentUser();

  useProjectEvents(null, { onEvent: handleEvent, scope: user ? "audience" : "inactive" });

  const notifications = useMemo<NotificationDTO[]>(
    () => events.map((event) => eventToNotification(
      event,
      new Date().toISOString(),
      readIds.has(event.id),
      archivedIds.has(event.id),
    )),
    [events, readIds, archivedIds],
  );

  const filtered = useMemo(
    () => notifications.filter((notification) => matchesCategory(notification, category)),
    [notifications, category],
  );

  const selected = filtered.find((notification) => notification.id === selectedId) ?? null;
  const selectedProjectId = selected?.projectId ?? null;

  // Read and archived flags survive navigation and reloads: the API only
  // streams live events, so the local ids are the source of truth here.
  const markAsRead = (notification: NotificationDTO): void => {
    setReadIds((current) => {
      const next = new Set(current).add(notification.id);

      persistIds(CACHE_KEYS.NOTIFICATION_READ_IDS, next);

      return next;
    });
  };

  const archive = (notification: NotificationDTO): void => {
    setArchivedIds((current) => {
      const next = new Set(current).add(notification.id);

      persistIds(CACHE_KEYS.NOTIFICATION_ARCHIVED_IDS, next);

      return next;
    });
  };

  const unarchive = (notification: NotificationDTO): void => {
    setArchivedIds((current) => {
      const next = new Set(current);

      next.delete(notification.id);

      persistIds(CACHE_KEYS.NOTIFICATION_ARCHIVED_IDS, next);

      return next;
    });
  };

  return (
    <div className="mx-auto w-full px-2 py-4 lg:px-6 lg:py-6">
      <div className="mx-0 grid min-h-[70vh] grid-cols-1 gap-4 lg:grid-cols-[240px_1fr_1fr]">
      {/* Category sidebar; horizontal chips on small screens */}
      <div className="p-4 bg-(--surface-1) border border-(--border-subtle)">
        <h1 className="mb-4 text-xl">Notificações</h1>
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {CATEGORIES.map(({ key, label }) => (
            <Button key={key} label={label} buttonType="button" colorType="primary"/>
          ))}
        </nav>
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto p-4 bg-(--surface-1) border border-(--border-subtle)">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-xl">{CATEGORIES.find((c) => c.key === category)?.label}</h2>
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
                    if (!selectedItem.isRead) markAsRead(selectedItem);
                  }}
                  onArchive={(archivedItem) => archive(archivedItem)}
                  onUnarchive={(unarchivedItem) => unarchive(unarchivedItem)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detail pane */}
      <div className="overflow-y-auto p-4">
        {selected ? (
          <>
            <h2 className="gb-heading text-xl">{selected.title}</h2>
            <p className="mt-1 text-sm text-(--gb-stone-600) tracking-wide">
              {formatRelativeTime(selected.createdAt) || String(selected.createdAt ?? "")}
            </p>
            <div className="mt-4 gb-glass p-4 shadow-[6px_6px_0px_#161212] border-2 border-(--gb-ink)">
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
                  label={selected.archived ? "Desarquivar" : "Arquivar"}
                  buttonType="button"
                  colorType="secondary"
                  onClick={() => (selected.archived ? unarchive(selected) : archive(selected))}
                />
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-center">
            <p className="gb-label text-(--gb-stone-400)">Selecione uma notificação para ver os detalhes.</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
