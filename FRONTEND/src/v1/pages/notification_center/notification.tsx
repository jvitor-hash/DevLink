import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/button_component";
import NotificationListItem from "@/components/ui/notification_list_item";
import { formatRelativeTime } from "@/utils/time_formatting";
import { eventToNotification } from "@/utils/notification_mapper";
import { useProjectEvents } from "@/hooks/use_project_events";
import { useCurrentUser } from "@/hooks/use_current_user";
import { cache, CACHE_KEYS } from "@/utils/session_cache";
import { notificationService } from "@/data/services/notification_service";
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
  const [category, setCategory] = useState<Category | null>("RECENTS");
  const [persistedNotifications, setPersistedNotifications] = useState<NotificationDTO[]>([]);
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => restoreIds(CACHE_KEYS.NOTIFICATION_READ_IDS));
  const [archivedIds, setArchivedIds] = useState<Set<string>>(() => restoreIds(CACHE_KEYS.NOTIFICATION_ARCHIVED_IDS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async (): Promise<void> => {
      try {
        const data = await notificationService.list();

        if (isMounted) {
          setPersistedNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  // Live feed: every project event becomes a notification entry.
  const handleEvent = useCallback((event: ProjectEvent): void => {
    setEvents((current) => [event, ...current.filter((existing) => existing.id !== event.id)]);
  }, []);

  const user = useCurrentUser();

  useProjectEvents(null, { onEvent: handleEvent, scope: user ? "audience" : "inactive" });

  const notifications = useMemo<NotificationDTO[]>(() => {
    const liveNotifications = events.map((event) =>
      eventToNotification(
        event,
        new Date().toISOString(),
        readIds.has(event.id),
        archivedIds.has(event.id)
      )
    );

    const mappedPersisted = persistedNotifications.map((notif) => ({
      ...notif,
      isRead: notif.isRead || readIds.has(notif.id),
      archived: archivedIds.has(notif.id) ? true : notif.archived,
    }));

    const seen = new Set<string>();
    const combined: NotificationDTO[] = [];

    for (const item of liveNotifications) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        combined.push(item);
      }
    }

    for (const item of mappedPersisted) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        combined.push(item);
      }
    }

    return combined;
  }, [events, persistedNotifications, readIds, archivedIds]);

  const filtered = useMemo(
    () => notifications.filter((notification) => matchesCategory(notification, category)),
    [notifications, category],
  );

  const selected = filtered.find((notification) => notification.id === selectedId) ?? null;
  const selectedProjectId = selected?.projectId ?? null;

  const markAsRead = async (notificationItem: NotificationDTO): Promise<void> => {
    setReadIds((current) => {
      const next = new Set(current).add(notificationItem.id);

      persistIds(CACHE_KEYS.NOTIFICATION_READ_IDS, next);

      return next;
    });

    setPersistedNotifications((current) =>
      current.map((item) => (item.id === notificationItem.id ? { ...item, isRead: true } : item))
    );

    try {
      await notificationService.markAsRead(notificationItem.id);
    } catch {
      // Ignore API errors for live-only events
    }
  };

  const archive = async (notificationItem: NotificationDTO): Promise<void> => {
    setArchivedIds((current) => {
      const next = new Set(current).add(notificationItem.id);

      persistIds(CACHE_KEYS.NOTIFICATION_ARCHIVED_IDS, next);

      return next;
    });

    setPersistedNotifications((current) =>
      current.map((item) => (item.id === notificationItem.id ? { ...item, archived: true } : item))
    );

    try {
      await notificationService.archive(notificationItem.id);
    } catch {
      // Ignore API errors for live-only events
    }
  };

  const unarchive = async (notificationItem: NotificationDTO): Promise<void> => {
    setArchivedIds((current) => {
      const next = new Set(current);

      next.delete(notificationItem.id);

      persistIds(CACHE_KEYS.NOTIFICATION_ARCHIVED_IDS, next);

      return next;
    });

    setPersistedNotifications((current) =>
      current.map((item) => (item.id === notificationItem.id ? { ...item, archived: false } : item))
    );

    try {
      await notificationService.unarchive(notificationItem.id);
    } catch {
      // Ignore API errors for live-only events
    }
  };

  return (
    <div className="mx-auto w-full px-2 py-4 lg:px-6 lg:py-6">
      <div className="mx-0 grid min-h-[70vh] grid-cols-1 gap-4 lg:grid-cols-[240px_1fr_1fr]">
      {/* Category sidebar; horizontal chips on small screens */}
      <div className="p-4 bg-(--surface-1) border border-(--border-subtle)">
        <h1 className="mb-4 text-xl">Notificações</h1>
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {CATEGORIES.map(({ key, label }) => (
            <Button
              key={key}
              label={label}
              buttonType="button"
              colorType={category === key ? "primary" : "secondary"}
              onClick={() => setCategory(key)}
            />
          ))}
        </nav>
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto p-4 bg-(--surface-1) border border-(--border-subtle)">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-xl">{CATEGORIES.find((c) => c.key === category)?.label}</h2>
        </div>

        {isLoading && notifications.length === 0 ? (
          <p className="text-(--text-muted) py-6 text-center">Carregando notificações...</p>
        ) : filtered.length === 0 ? (
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
