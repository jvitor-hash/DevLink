import { auth } from "@/auth";
import Elysia from "elysia";

type SocketData = {
  userId?: string;
};

// Per-user socket registry; a user may have several tabs open.
const sockets = new Map<string, Set<any>>();

const addSocket = (userId: string, ws: any): void => {
  const set = sockets.get(userId) ?? new Set<any>();
  set.add(ws);
  sockets.set(userId, set);
};

const removeSocket = (userId: string, ws: any): void => {
  const set = sockets.get(userId);
  if (!set) return;

  set.delete(ws);
  if (set.size === 0) sockets.delete(userId);
};

// Push a notification row to every open socket of one user.
export const notifyUserSockets = (userId: string, notification: object): void => {
  const set = sockets.get(userId);
  if (!set) return;

  const frame = JSON.stringify({ type: "notification", notification });
  for (const ws of set) {
    try {
      ws.send(frame);
    } catch {
      // Broken socket; it is removed on close.
    }
  }
};

export const Websocket_Notifications = new Elysia()
  .ws("/ws/notifications", {
    async beforeHandle(context) {
      const session = await auth.api.getSession({ headers: context.request.headers });
      if (!session) {
        throw new Error("Unauthorized");
      }

      (context as SocketData).userId = session.user.id;
    },

    open(ws) {
      const data = ws.data as SocketData;
      if (!data.userId) return;

      addSocket(data.userId, ws);
    },

    close(ws) {
      const data = ws.data as SocketData;
      if (!data.userId) return;

      removeSocket(data.userId, ws);
    },
  });
