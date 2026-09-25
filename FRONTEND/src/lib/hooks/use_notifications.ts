import { useCallback, useEffect, useRef, useState } from "react";
import { notificationService } from "@/services/notification_service";
import { BASE_URL, type NotificationDTO } from "@/lib/types/database";

type ServerFrame =
  | { type: "notification"; notification: NotificationDTO }
  | { type: "error"; error: string };

// Notification rows pushed by the API fan-out land here first; REST is the fallback.
export function useNotifications(maxItems = 50): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const maxItemsRef = useRef<number>(maxItems);
  maxItemsRef.current = maxItems;

  const ingest = useCallback((row: NotificationDTO): void => {
    if (seenIdsRef.current.has(row.id)) return;

    seenIdsRef.current.add(row.id);
    setNotifications((prev) => [row, ...prev].slice(0, maxItemsRef.current));
  }, []);

  // One-time history load; live rows arrive over the socket afterwards.
  const refresh = useCallback(async (): Promise<void> => {
    try {
      const page = await notificationService.list({ limit: maxItemsRef.current, offset: 0 });

      if (!Array.isArray(page)) return;

      for (const row of page) seenIdsRef.current.add(row.id);
      setNotifications(page);
    } catch {
      // Offline or unauthorized; the socket retry loop keeps the UI alive.
    }
  }, []);

  useEffect((): (() => void) => {
    let disposed = false;
    let socket: WebSocket | null = null;

    const connect = (): void => {
      socket = new WebSocket(`${BASE_URL.replace(/^http/, "ws")}/ws/notifications`);
      socketRef.current = socket;

      socket.onopen = (): void => {
        reconnectAttemptRef.current = 0;
        setIsConnected(true);
      };

      socket.onmessage = (event: MessageEvent<string>): void => {
        try {
          const frame = JSON.parse(event.data) as ServerFrame;

          if (frame.type === "notification") ingest(frame.notification);
        } catch {
          // Ignore malformed frames.
        }
      };

      socket.onclose = (): void => {
        if (disposed) return;

        setIsConnected(false);

        const attempt = reconnectAttemptRef.current++;
        const delay = Math.min(30_000, 500 * 2 ** attempt);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };
    };

    void refresh().then(connect);

    return () => {
      disposed = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socket?.close();
    };
  }, [refresh, ingest]);

  const markAsRead = useCallback(async (id: string): Promise<void> => {
    setNotifications((prev) => prev.map((row) => (row.id === id ? { ...row, isRead: true } : row)));

    try {
      await notificationService.update(id, { isRead: true });
    } catch {
      // Optimistic; refetch will reconcile.
    }
  }, []);

  const unreadCount = notifications.filter((row) => !row.isRead).length;

  return { notifications, unreadCount, isConnected, refresh, markAsRead };
}

interface UseNotificationsResult {
  notifications: NotificationDTO[];
  unreadCount: number;
  isConnected: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}
