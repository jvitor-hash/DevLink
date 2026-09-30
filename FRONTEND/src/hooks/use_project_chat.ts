import { useCallback, useEffect, useRef, useState } from "react";

import {
  generateKeyPair,
  exportPublicKey,
  importPeerPublicKey,
  serializeKeyPair,
  deserializeKeyPair,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
  isEncryptedEnvelope,
} from "@/utils/crypto";
import { userSingleton } from "@/context/user";
import { messageService } from "@/data/services/message_service";
import { userService } from "@/data/services/user_service";
import { BASE_URL, type MessageDTO } from "@/data/types/database";

// Wire frames exchanged with the API /ws endpoint.
type ClientFrame =
  | { type: "join"; projectId: string; publicKey: string }
  | { type: "leave"; projectId: string }
  | { type: "message"; projectId: string; content: string }
  | { type: "offer"; projectId: string; content: string; offerDeadline: string }
  | { type: "offer-response"; projectId: string; messageId: string; offerStatus: "ACCEPTED" | "REJECTED" }
  | { type: "read"; projectId: string; messageIds: string[] };

type ServerFrame =
  | { type: "joined"; projectId: string; keys: Record<string, string[]> }
  | { type: "peer-joined"; projectId: string; userId: string; publicKey: string }
  | { type: "peer-left"; projectId: string; userId: string }
  | { type: "left"; projectId: string }
  | { type: "capability"; projectId: string; capability: "NONE" | "VIEW" | "MESSAGE" | "OFFER" }
  | {
    type: "message";
    id: string;
    projectId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    offerDeadline?: string | null;
    offerStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | null;
    createdAt?: string | Date | null;
  }
  | { type: "message-update"; id?: string; projectId: string; messageIds?: string[]; isRead?: boolean; offerStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | null }
  | { type: "error"; error: string };

export type ChatCapability = "NONE" | "VIEW" | "MESSAGE" | "OFFER";

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  offerDeadline: string | null;
  offerStatus: "PENDING" | "ACCEPTED" | "REJECTED" | null;
  createdAt: string;
  pending: boolean;
}

type OfferIntent = { content: string; offerDeadline: string };

export interface ChatParticipant {
  senderId: string;
  name: string;
  messageCount: number;
  lastMessageAt: string | null;
}

interface UseProjectChatResult {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  isConnected: boolean;
  isEncrypted: boolean;
  capability: ChatCapability;
  error: string | null;
  sendMessage: (content: string) => void;
  sendOffer: (content: string, offerDeadline: string) => void;
  respondToOffer: (messageId: string, offerStatus: "ACCEPTED" | "REJECTED") => void;
  markMessagesAsRead: (messageIds: string[]) => void;
}

// Retention horizon for locally stored session keys; mirrors the API-side
// 30-day pruning of messages and public keys.
const SESSION_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

type StoredSessionKey = { publicJwk: JsonWebKey; privateJwk: JsonWebKey; createdAt: string };

const storageKeyFor = (userId: string): string => `devlink:chat-keys:${userId}`;

const loadStoredKeyRing = (userId: string): StoredSessionKey[] => {
  try {
    const raw = localStorage.getItem(storageKeyFor(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StoredSessionKey[];
    const cutoff = Date.now() - SESSION_RETENTION_MS;
    const fresh = parsed.filter((entry) => entry.createdAt && new Date(entry.createdAt).getTime() >= cutoff);

    localStorage.setItem(storageKeyFor(userId), JSON.stringify(fresh));

    return fresh;
  } catch {
    return [];
  }
};

const persistKeyRing = (userId: string, ring: StoredSessionKey[]): void => {
  try {
    localStorage.setItem(storageKeyFor(userId), JSON.stringify(ring.slice(-20)));
  } catch {
    // Storage unavailable; keys stay memory-only for this session.
  }
};

// One key ring and one active session key per page load; panel mount/unmount
// cycles reuse it, and a reload naturally starts a new session key.
const sessionRings = new Map<string, StoredSessionKey[]>();
const activeSessionKeys = new Map<string, { privateKey: CryptoKey; publicKey: string }>();

const getSessionRing = async (userId: string): Promise<{ privateKey: CryptoKey; publicKey: string }> => {
  const active = activeSessionKeys.get(userId);
  if (active) return active;

  let ring = sessionRings.get(userId);
  if (!ring) {
    ring = loadStoredKeyRing(userId);
    sessionRings.set(userId, ring);
  }

  const keyPair = await generateKeyPair();
  const serialized = await serializeKeyPair(keyPair);
  const stored: StoredSessionKey = { ...serialized, createdAt: new Date().toISOString() };

  ring.push(stored);
  persistKeyRing(userId, ring);
  ownKeysCache.delete(userId);

  const restored = await deserializeKeyPair(stored);
  const session = { privateKey: restored.privateKey, publicKey: await exportPublicKey(keyPair) };

  activeSessionKeys.set(userId, session);

  return session;
};

const ownKeysCache = new Map<string, CryptoKey[]>();

const getOwnPrivateKeys = async (userId: string): Promise<CryptoKey[]> => {
  const cached = ownKeysCache.get(userId);
  if (cached) return cached;

  const ring = sessionRings.get(userId) ?? loadStoredKeyRing(userId);

  const keys: CryptoKey[] = [];
  for (const entry of ring) {
    try {
      const pair = await deserializeKeyPair(entry);
      keys.push(pair.privateKey);
    } catch {
      // Skip entries that cannot be imported anymore.
    }
  }

  ownKeysCache.set(userId, keys);

  return keys;
};

const toChatMessage = (row: MessageDTO, content: string): ChatMessage => {
  return {
    id: row.id,
    senderId: row.senderId,
    content,
    isRead: row.isRead,
    offerDeadline: row.offerDeadline ? String(row.offerDeadline) : null,
    offerStatus: row.offerStatus ?? null,
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    pending: false,
  };
};

export function useProjectChat(projectId: string | undefined): UseProjectChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [capability, setCapability] = useState<ChatCapability>("NONE");
  const [error, setError] = useState<string | null>(null);

  // senderId -> user name, filled once per participant.
  const participantNamesRef = useRef<Map<string, string>>(new Map());

  const resolveParticipantNames = useCallback(async (senderIds: string[]): Promise<void> => {
    const unknown = senderIds.filter((id) => id && !participantNamesRef.current.has(id));
    if (!unknown.length) return;

    for (const senderId of unknown) {
      try {
        const user = await userService.getById(senderId);
        participantNamesRef.current.set(senderId, user.name);
      } catch {
        participantNamesRef.current.set(senderId, senderId.slice(0, 8));
      }
    }

    setParticipants((prev) =>
      prev.map((participant) => ({
        ...participant,
        name: participantNamesRef.current.get(participant.senderId) ?? participant.name,
      })),
    );
  }, []);

  // Aggregate participants (users who sent at least one message) from the
  // current message list.
  useEffect(() => {
    const counts = new Map<string, number>();
    const lastAt = new Map<string, string>();

    for (const message of messages) {
      counts.set(message.senderId, (counts.get(message.senderId) ?? 0) + 1);

      const previous = lastAt.get(message.senderId);
      if (!previous || new Date(message.createdAt).getTime() > new Date(previous).getTime()) {
        lastAt.set(message.senderId, message.createdAt);
      }
    }

    setParticipants((prev) => {
      const next = [...counts.entries()].map(([senderId, messageCount]) => ({
        senderId,
        name: participantNamesRef.current.get(senderId) ?? senderId.slice(0, 8),
        messageCount,
        lastMessageAt: lastAt.get(senderId) ?? null,
      }));

      const same =
        prev.length === next.length &&
        prev.every((participant, index) =>
          participant.senderId === next[index].senderId &&
          participant.messageCount === next[index].messageCount &&
          participant.name === next[index].name,
        );

      return same ? prev : next;
    });

    void resolveParticipantNames([...counts.keys()]);
  }, [messages, resolveParticipantNames]);

  const wsRef = useRef<WebSocket | null>(null);
  // My session private keys, oldest first.
  const ownKeysRef = useRef<CryptoKey[]>([]);
  // userId -> every session public key they ever advertised (newest last).
  const peerKeyRingsRef = useRef<Map<string, CryptoKey[]>>(new Map());
  // senderId -> shared key that last decrypted one of their messages.
  const sharedKeyCacheRef = useRef<Map<string, CryptoKey>>(new Map());
  const pendingOffersRef = useRef<OfferIntent[]>([]);
  const historyRef = useRef<MessageDTO[]>([]);

  // Tries every stored session combination for a sender; remembers the key
  // that worked so later messages skip the search.
  const decryptFrom = useCallback(async (senderId: string, content: string): Promise<string> => {
    if (!isEncryptedEnvelope(content)) return content;

    const parsed = JSON.parse(content) as { iv: string; ciphertext: string };

    const cached = sharedKeyCacheRef.current.get(senderId);
    if (cached) {
      try {
        return await decryptMessage(cached, parsed.iv, parsed.ciphertext);
      } catch {
        sharedKeyCacheRef.current.delete(senderId);
      }
    }

    const peerKeys = peerKeyRingsRef.current.get(senderId) ?? [];

    for (const ownKey of [...ownKeysRef.current].reverse()) {
      for (const peerKey of [...peerKeys].reverse()) {
        try {
          const shared = await deriveSharedKey(ownKey, peerKey);
          const plaintext = await decryptMessage(shared, parsed.iv, parsed.ciphertext);

          sharedKeyCacheRef.current.set(senderId, shared);

          return plaintext;
        } catch {
          // Wrong combination; keep searching.
        }
      }
    }

    return content;
  }, []);

  // My own history rows were sealed with one of my keys plus a peer session key.
  const decryptOwnRow = useCallback(async (content: string): Promise<string> => {
    if (!isEncryptedEnvelope(content)) return content;

    const parsed = JSON.parse(content) as { iv: string; ciphertext: string };
    const ownId = userSingleton.getCachedUser()?.id;

    for (const [peerId, ring] of peerKeyRingsRef.current) {
      if (peerId === ownId) continue;

      for (const peerKey of [...ring].reverse()) {
        for (const ownKey of [...ownKeysRef.current].reverse()) {
          try {
            const shared = await deriveSharedKey(ownKey, peerKey);

            return await decryptMessage(shared, parsed.iv, parsed.ciphertext);
          } catch {
            // Wrong combination; keep searching.
          }
        }
      }
    }

    return content;
  }, []);

  // Encrypts with my newest session key towards the newest session of the
  // first peer in the room.
  const encryptContent = useCallback(async (content: string): Promise<string> => {
    const ownKey = ownKeysRef.current[ownKeysRef.current.length - 1];
    if (!ownKey) return content;

    const ownId = userSingleton.getCachedUser()?.id;

    for (const [peerId, ring] of peerKeyRingsRef.current) {
      if (peerId === ownId) continue;

      const peerKey = ring[ring.length - 1];
      if (!peerKey) continue;

      const shared = await deriveSharedKey(ownKey, peerKey);
      const { iv, ciphertext } = await encryptMessage(shared, content);

      return JSON.stringify({ iv, ciphertext });
    }

    return content;
  }, []);

  useEffect(() => {
    if (!projectId) return;

    let closed = false;
    const socket = new WebSocket(`${BASE_URL.replace(/^http/, "ws")}/ws`);
    wsRef.current = socket;

    const join = async () => {
      const user = userSingleton.getCachedUser() ?? await userSingleton.getCurrentUser();
      if (!user) {
        setError("Sessão expirada. Faça login novamente.");
        socket.close();
        return;
      }

      const session = await getSessionRing(user.id);
      ownKeysRef.current = await getOwnPrivateKeys(user.id);

      const frame: ClientFrame = {
        type: "join",
        projectId,
        publicKey: session.publicKey,
      };
      socket.send(JSON.stringify(frame));
    };

    socket.onopen = () => {
      // History first, then join: hydration triggered by "joined"/"peer-joined"
      // always finds the REST rows already in place (no empty-snapshot race).
      void (async () => {
        await loadHistory();
        await join();
      })();
    };

    // Restores every history row, including my own; rows render even without
    // a peer key (plaintext or raw) and are upgraded once keys are derived.
    const hydrateHistory = async (): Promise<void> => {
      const ownId = userSingleton.getCachedUser()?.id;

      const decrypted = await Promise.all(
        historyRef.current.map(async (row) => {
          const content = row.senderId === ownId
            ? await decryptOwnRow(row.content)
            : await decryptFrom(row.senderId, row.content);

          return toChatMessage(row, content);
        }),
      );

      // Upsert by id: hydration runs before/after history loads and again as
      // keys arrive, replacing raw rows with decrypted content.
      setMessages((prev) => {
        const byId = new Map(prev.map((message) => [message.id, message]));

        for (const message of decrypted) {
          byId.set(message.id, message);
        }

        return [...byId.values()].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });
    };

    // REST history: rows render immediately; encrypted ones upgrade once peer keys arrive.
    const loadHistory = async () => {
      try {
        const rows = await messageService.listByProject(projectId);
        historyRef.current = rows;
        await hydrateHistory();
      } catch {
        // History is best-effort; realtime still works.
      }
    };

    socket.onmessage = async (event) => {
      let frame: ServerFrame;
      try {
        frame = JSON.parse(String(event.data)) as ServerFrame;
      } catch {
        return;
      }

      switch (frame.type) {
        case "joined": {
          setIsConnected(true);
          setError(null);

          for (const [peerId, peerKeys] of Object.entries(frame.keys)) {
            const imported: CryptoKey[] = [];
            for (const peerPublicKey of peerKeys) {
              try {
                imported.push(await importPeerPublicKey(peerPublicKey));
              } catch {
                // Skip keys that cannot be imported.
              }
            }

            if (imported.length) peerKeyRingsRef.current.set(peerId, imported);
          }

          await hydrateHistory();
          setIsEncrypted(peerKeyRingsRef.current.size > 0);

          // Offers queued before a peer key existed are encrypted and sent now.
          const queued = pendingOffersRef.current.splice(0);
          for (const offer of queued) {
            const payload = await encryptContent(offer.content);
            socket.send(JSON.stringify({ type: "offer", projectId, content: payload, offerDeadline: offer.offerDeadline }));
          }
          break;
        }

        case "capability": {
          setCapability(frame.capability);
          break;
        }

        case "peer-joined": {
          try {
            const peerKey = await importPeerPublicKey(frame.publicKey);
            const ring = peerKeyRingsRef.current.get(frame.userId) ?? [];
            peerKeyRingsRef.current.set(frame.userId, [...ring, peerKey]);
            setIsEncrypted(true);
            await hydrateHistory();

            // A late peer unblocks offers queued while the room was empty.
            const queued = pendingOffersRef.current.splice(0);
            for (const offer of queued) {
              const payload = await encryptContent(offer.content);
              socket.send(JSON.stringify({ type: "offer", projectId, content: payload, offerDeadline: offer.offerDeadline }));
            }
          } catch {
            // Ignore malformed peer keys.
          }
          break;
        }

        case "peer-left": {
          // Keep derived keys; offline peers must stay decryptable.
          break;
        }

        case "message": {
          // The server echoes our own broadcasts back; reconcile the optimistic
          // row instead of rendering ciphertext (both peers share the same secret).
          const ownId = userSingleton.getCachedUser()?.id;
          if (frame.senderId === ownId) {
            const ownContent = await decryptOwnRow(frame.content);

            setMessages((prev) => {
              const index = prev.findIndex((message) => message.pending && message.senderId === ownId);
              if (index === -1) return prev;

              const next = [...prev];
              next[index] = {
                ...next[index],
                id: frame.id,
                content: ownContent,
                offerDeadline: frame.offerDeadline ?? next[index].offerDeadline,
                offerStatus: frame.offerStatus ?? next[index].offerStatus,
                createdAt: String(frame.createdAt ?? next[index].createdAt),
                pending: false,
              };

              return next;
            });
            break;
          }

          const plaintext = await decryptFrom(frame.senderId, frame.content);
          setMessages((prev) => [
            ...prev,
            {
              id: frame.id,
              senderId: frame.senderId,
              content: plaintext,
              isRead: frame.isRead,
              offerDeadline: frame.offerDeadline ?? null,
              offerStatus: frame.offerStatus ?? null,
              createdAt: String(frame.createdAt ?? new Date().toISOString()),
              pending: false,
            },
          ]);
          break;
        }

        case "message-update": {
          const updateIds = new Set(frame.messageIds ?? (frame.id ? [frame.id] : []));

          setMessages((prev) =>
            prev.map((message) =>
              // No ids at all means a room-wide update (e.g. every message read).
              updateIds.size === 0 || updateIds.has(message.id)
                ? {
                  ...message,
                  isRead: frame.isRead ?? message.isRead,
                  offerStatus: frame.offerStatus ?? message.offerStatus,
                }
                : message,
            ),
          );
          break;
        }

        case "error": {
          setError(frame.error);
          break;
        }
      }
    };

    socket.onerror = () => {
      setError("Falha na conexão do chat.");
    };

    socket.onclose = () => {
      if (!closed) {
        setIsConnected(false);
        setIsEncrypted(false);
      }
    };

    return () => {
      closed = true;

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "leave", projectId } satisfies ClientFrame));
      }
      socket.close();
      wsRef.current = null;
      peerKeyRingsRef.current = new Map();
      sharedKeyCacheRef.current = new Map();
      historyRef.current = [];
      setIsConnected(false);
    };
  }, [projectId, decryptFrom, encryptContent, decryptOwnRow]);

  const appendOptimistic = useCallback((partial: Omit<ChatMessage, "createdAt" | "pending">): void => {
    setMessages((prev) => [
      ...prev,
      {
        ...partial,
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);
  }, []);

  const sendMessage = useCallback((content: string) => {
    const socket = wsRef.current;
    const trimmed = content.trim();

    if (!socket || socket.readyState !== WebSocket.OPEN || !projectId || !trimmed) return;
    if (capability !== "MESSAGE" && capability !== "OFFER") return;

    const ownId = userSingleton.getCachedUser()?.id ?? "";
    appendOptimistic({ id: `pending-${Date.now()}`, senderId: ownId, content: trimmed, isRead: false, offerDeadline: null, offerStatus: null });

    void (async () => {
      const payload = await encryptContent(trimmed);
      socket.send(JSON.stringify({ type: "message", projectId, content: payload } satisfies ClientFrame));
    })();
  }, [projectId, encryptContent, appendOptimistic, capability]);

  const sendOffer = useCallback((content: string, offerDeadline: string) => {
    const socket = wsRef.current;
    const trimmed = content.trim();

    if (!socket || socket.readyState !== WebSocket.OPEN || !projectId || !trimmed || !offerDeadline) return;
    if (capability !== "OFFER") return;

    const ownId = userSingleton.getCachedUser()?.id ?? "";

    // Room key not ready yet: render optimistically and queue the frame; it is
    // encrypted and sent when a peer key arrives ("joined"/"peer-joined").
    if (peerKeyRingsRef.current.size === 0) {
      appendOptimistic({ id: `pending-${Date.now()}`, senderId: ownId, content: trimmed, isRead: false, offerDeadline, offerStatus: "PENDING" });
      pendingOffersRef.current.push({ content: trimmed, offerDeadline });
      return;
    }

    appendOptimistic({ id: `pending-${Date.now()}`, senderId: ownId, content: trimmed, isRead: false, offerDeadline, offerStatus: "PENDING" });

    void (async () => {
      const payload = await encryptContent(trimmed);
      const frame: ClientFrame = { type: "offer", projectId, content: payload, offerDeadline };

      socket.send(JSON.stringify(frame));
    })();
  }, [projectId, encryptContent, appendOptimistic, capability]);

  const respondToOffer = useCallback((messageId: string, offerStatus: "ACCEPTED" | "REJECTED") => {
    const socket = wsRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN || !projectId) return;

    socket.send(JSON.stringify({ type: "offer-response", projectId, messageId, offerStatus } satisfies ClientFrame));
  }, [projectId]);

  // Flags messages as seen (persisted server-side) and updates local state
  // immediately so unseen badges drop without waiting for the echo.
  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    const socket = wsRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN || !projectId || !messageIds.length) return;

    const idSet = new Set(messageIds);

    setMessages((prev) => prev.map((message) => (idSet.has(message.id) ? { ...message, isRead: true } : message)));

    socket.send(JSON.stringify({ type: "read", projectId, messageIds } satisfies ClientFrame));
  }, [projectId]);

  return {
    messages,
    participants,
    isConnected,
    isEncrypted,
    capability,
    error,
    sendMessage,
    sendOffer,
    respondToOffer,
    markMessagesAsRead,
  };
}
