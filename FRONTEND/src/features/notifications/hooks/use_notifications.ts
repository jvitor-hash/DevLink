import { useState, useEffect, useCallback, useMemo } from "react";
import { notificationService } from "../service/notification_service";
import type { NotificationDTO } from "@/shared/types/database";
import { toast } from "@/shared/utils/toast_store";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await notificationService.list({ limit: 50 });
    if (result.success && result.data) {
      setNotifications(result.data);
    } else {
      setError(result.errors?.message || "Falha ao carregar notificações.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead && !n.archived).length,
    [notifications]
  );

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await notificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    const res = await notificationService.markAllAsRead();
    if (res.success) {
      toast.success("Todas as notificações marcadas como lidas.");
    }
  }, []);

  const toggleArchive = useCallback(async (notification: NotificationDTO) => {
    const nextArchived = !notification.archived;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, archived: nextArchived } : n))
    );
    if (nextArchived) {
      await notificationService.archive(notification.id);
      toast.info("Notificação arquivada.");
    } else {
      await notificationService.unarchive(notification.id);
      toast.info("Notificação desarquivada.");
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    toggleArchive,
    refetch: fetchNotifications,
  };
}
