import { logger } from "./logger";

export type SSEEvent = {
  id: string;
  event: string;
  data: unknown;
  audienceUserIds: string[];
};

type Client = {
  userId: string;
  connectedAt: number;
  write: (chunk: string) => void;
};

const clients = new Map<string, Client>();

const sseFrame = (event: SSEEvent): string => {
  const payload = typeof event.data === "string" ? event.data : JSON.stringify(event.data);

  return `id: ${event.id}\nevent: ${event.event}\ndata: ${payload}\n\n`;
};

const heartbeatFrame = ": heartbeat\n\n";

// Fan the event out to every connection owned by an audience member.
// Returns how many clients actually received it (0 means nobody was connected).
const publish = (event: SSEEvent): number => {
  const frame = sseFrame(event);
  let delivered = 0;

  for (const [clientId, client] of clients) {
    if (!event.audienceUserIds.includes(client.userId)) continue;

    try {
      client.write(frame);
      delivered += 1;
    } catch (error) {
      logger.warn("[sse-hub] write failed, dropping client", clientId, error);
      clients.delete(clientId);
    }
  }

  return delivered;
};

const register = (userId: string, write: (chunk: string) => void): string => {
  const clientId = crypto.randomUUID();
  clients.set(clientId, { userId, connectedAt: Date.now(), write });

  return clientId;
};

const unregister = (clientId: string): void => {
  clients.delete(clientId);
};

const startHeartbeats = (intervalMs = 20_000): Timer => {
  return setInterval(() => {
    for (const [clientId, client] of clients) {
      try {
        client.write(heartbeatFrame);
      } catch {
        clients.delete(clientId);
      }
    }
  }, intervalMs);
};

const stats = () => ({
  connectionsActive: clients.size,
  users: new Set([...clients.values()].map((client) => client.userId)).size,
});

// Test hook: lets unit tests inspect and reset the hub without a live stream.
const reset = (): void => {
  clients.clear();
};

const clientCountForUser = (userId: string): number =>
  [...clients.values()].filter((client) => client.userId === userId).length;

export const SseHub = {
  publish,
  register,
  unregister,
  startHeartbeats,
  stats,
  reset,
  clientCountForUser,
};

export type { Client as SseClient };
