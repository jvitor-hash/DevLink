import { useCallback, useEffect, useState } from "react";
import { type NotificationDTO } from "../types/database";
import { WebSocketClient } from "../utils/websocket_client";
import { notificationService } from "@/services/notification_service";

type MessageStructure =
  | { type: "notification"; notification: NotificationDTO }
  | { type: "error"; error: string };

interface UseNotificationResult {
  notifications: NotificationDTO[];
  unreadCount: number;
  isConnected: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export function useNotifications(maxItems: number): UseNotificationResult {
  const [notifications, setNotifications] = useState<
    Map<string, NotificationDTO>
  >(new Map());

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const websocket = new WebSocketClient({
      socket_route: "/ws/notifications",
    });

    websocket.broadcast((message: MessageEvent) => {
      try {
        const data = JSON.parse(message.data) as MessageStructure;

        if (data.type === "notification") {
          setNotifications((current) => {
            const next = new Map(current);

            next.set(data.notification.id, data.notification);

            return next;
          });
        }

        if (data.type === "error") {
          console.error(data.error);
        }

        setIsConnected(true);
      } catch (error) {
        console.error(`Websocket notification malformed | ${error}`);
      }
    });

    return () => {
      websocket.close();
      setIsConnected(false);
    };
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const page = await notificationService.list({
        limit: maxItems,
        offset: 0,
      });

      if (!Array.isArray(page)) {
        console.error("Invalid notification response");
        return;
      }

      setNotifications((current) => {
        const next = new Map(current);

        for (const notification of page) {
          next.set(notification.id, notification);
        }

        return next;
      });
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    }
  }, [maxItems]);

  const markAsRead = useCallback(async (id: string): Promise<void> => {
    try {
      await notificationService.update(id, { isRead: true });

      setNotifications((current) => {
        const notification = current.get(id);

        if (!notification || notification.isRead) {
          return current;
        }

        const next = new Map(current);

        next.set(id, {
          ...notification,
          isRead: true,
        });

        return next;
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const notificationList = Array.from(notifications.values());

  const unreadCount = notificationList.reduce(
    (count, notification) => count + (notification.isRead ? 0 : 1),
    0,
  );

  return {
    notifications: notificationList,
    unreadCount,
    isConnected,
    refresh,
    markAsRead,
  };
}
