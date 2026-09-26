import { useCallback, useEffect, useRef, useState } from "react";

import {
  generateKeyPair,
  exportPublicKey,
  importPeerPublicKey,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
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
  | { type: "joined"; projectId: string; keys: Record<string, string> }
  | { type: "peer-joined"; projectId: string; userId: string; publicKey: string }
  | { type: "peer-left"; projectId: string; userId: string }
  | { type: "left"; projectId: string }
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
  | { type: "message-update"; id?: string; projectId: string; isRead?: boolean; offerStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | null }
  | { type: "error"; error: string };

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
  error: string | null;
  sendMessage: (content: string) => void;
  sendOffer: (content: string, offerDeadline: string) => void;
  respondToOffer: (messageId: string, offerStatus: "ACCEPTED" | "REJECTED") => void;
}

// One shared hook instance per module keeps keys across panel mounts; the
// connection itself is per-project.
const keyPairCache = new Map<string, { keyPair: CryptoKeyPair; publicKey: string }>();

const getOrCreateKeyPair = async (userId: string): Promise<{ keyPair: CryptoKeyPair; publicKey: string }> => {
  const cached = keyPairCache.get(userId);
  if (cached) return cached;

  const keyPair = await generateKeyPair();
  const publicKey = await exportPublicKey(keyPair);
  const entry = { keyPair, publicKey };
  keyPairCache.set(userId, entry);

  return entry;
};

const toChatMessage = async (
  row: MessageDTO,
  senderKey: CryptoKey | undefined,
): Promise<ChatMessage> => {
  let content = row.content;

  if (senderKey) {
    try {
      const parsed = JSON.parse(row.content) as { iv: string; ciphertext: string };
      content = await decryptMessage(senderKey, parsed.iv, parsed.ciphertext);
    } catch {
      // Keep raw content when it is not an encrypted envelope.
    }
  }

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
  const keyPairRef = useRef<{ keyPair: CryptoKeyPair; publicKey: string } | null>(null);
  // peer userId -> derived AES-GCM key.
  const peerKeysRef = useRef<Map<string, CryptoKey>>(new Map());
  const pendingOffersRef = useRef<OfferIntent[]>([]);
  const historyRef = useRef<MessageDTO[]>([]);

  const decryptFrom = useCallback(async (senderId: string, content: string): Promise<string> => {
    const peerKey = peerKeysRef.current.get(senderId);
    if (!peerKey) return content;

    try {
      const parsed = JSON.parse(content) as { iv: string; ciphertext: string };
      return await decryptMessage(peerKey, parsed.iv, parsed.ciphertext);
    } catch {
      return content;
    }
  }, []);

  const encryptContent = useCallback(async (content: string): Promise<string> => {
    // Encrypt towards the first peer; both participants share the same secret.
    const peerKey = peerKeysRef.current.values().next().value as CryptoKey | undefined;
    if (!peerKey) return content;

    const { iv, ciphertext } = await encryptMessage(peerKey, content);

    return JSON.stringify({ iv, ciphertext });
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

      keyPairRef.current = await getOrCreateKeyPair(user.id);
      const frame: ClientFrame = {
        type: "join",
        projectId,
        publicKey: keyPairRef.current.publicKey,
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
      const firstPeerKey = [...peerKeysRef.current.entries()].find(([id]) => id !== ownId)?.[1];

      const decrypted = await Promise.all(
        historyRef.current.map((row) => {
          // My own rows were sealed with the shared peer secret; unknown
          // senders have no key yet and fall back to raw content.
          const key = row.senderId === ownId ? firstPeerKey : peerKeysRef.current.get(row.senderId);

          return toChatMessage(row, key);
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

          for (const [peerId, peerPublicKey] of Object.entries(frame.keys)) {
            if (!keyPairRef.current || peerKeysRef.current.has(peerId)) continue;

            try {
              const peerKey = await importPeerPublicKey(peerPublicKey);
              const shared = await deriveSharedKey(keyPairRef.current.keyPair, peerKey);
              peerKeysRef.current.set(peerId, shared);
            } catch {
              // Skip peers whose keys cannot be imported; messages fall back to plaintext.
            }
          }

          await hydrateHistory();
          setIsEncrypted(peerKeysRef.current.size > 0);

          // Offers queued before a peer key existed are encrypted and sent now.
          const queued = pendingOffersRef.current.splice(0);
          for (const offer of queued) {
            const payload = await encryptContent(offer.content);
            socket.send(JSON.stringify({ type: "offer", projectId, content: payload, offerDeadline: offer.offerDeadline }));
          }
          break;
        }

        case "peer-joined": {
          if (!keyPairRef.current || peerKeysRef.current.has(frame.userId)) break;

          try {
            const peerKey = await importPeerPublicKey(frame.publicKey);
            const shared = await deriveSharedKey(keyPairRef.current.keyPair, peerKey);
            peerKeysRef.current.set(frame.userId, shared);
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
          peerKeysRef.current.delete(frame.userId);
          break;
        }

        case "message": {
          // The server echoes our own broadcasts back; reconcile the optimistic
          // row instead of rendering ciphertext (both peers share the same secret).
          const ownId = userSingleton.getCachedUser()?.id;
          if (frame.senderId === ownId) {
            const peerKey = peerKeysRef.current.values().next().value as CryptoKey | undefined;
            let ownContent = frame.content;

            if (peerKey) {
              try {
                const parsed = JSON.parse(frame.content) as { iv: string; ciphertext: string };
                ownContent = await decryptMessage(peerKey, parsed.iv, parsed.ciphertext);
              } catch {
                // Payload was plaintext (sent before any peer key existed).
              }
            }

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
          setMessages((prev) =>
            prev.map((message) =>
              message.id === frame.id || !frame.id
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
      peerKeysRef.current = new Map();
      historyRef.current = [];
      setIsConnected(false);
    };
  }, [projectId, decryptFrom, encryptContent]);

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

    const ownId = userSingleton.getCachedUser()?.id ?? "";
    appendOptimistic({ id: `pending-${Date.now()}`, senderId: ownId, content: trimmed, isRead: false, offerDeadline: null, offerStatus: null });

    void (async () => {
      const payload = await encryptContent(trimmed);
      socket.send(JSON.stringify({ type: "message", projectId, content: payload } satisfies ClientFrame));
    })();
  }, [projectId, encryptContent, appendOptimistic]);

  const sendOffer = useCallback((content: string, offerDeadline: string) => {
    const socket = wsRef.current;
    const trimmed = content.trim();

    if (!socket || socket.readyState !== WebSocket.OPEN || !projectId || !trimmed || !offerDeadline) return;

    const ownId = userSingleton.getCachedUser()?.id ?? "";

    // Room key not ready yet: render optimistically and queue the frame; it is
    // encrypted and sent when a peer key arrives ("joined"/"peer-joined").
    if (peerKeysRef.current.size === 0) {
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
  }, [projectId, encryptContent, appendOptimistic]);

  const respondToOffer = useCallback((messageId: string, offerStatus: "ACCEPTED" | "REJECTED") => {
    const socket = wsRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN || !projectId) return;

    socket.send(JSON.stringify({ type: "offer-response", projectId, messageId, offerStatus } satisfies ClientFrame));
  }, [projectId]);

  return {
    messages,
    participants,
    isConnected,
    isEncrypted,
    error,
    sendMessage,
    sendOffer,
    respondToOffer,
  };
}
