import { useCallback, useEffect, useRef, useState } from "react";

import {
  generateKeyPair,
  exportPublicKey,
  importPeerPublicKey,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
} from "@/lib/crypto";
import { authService } from "@/services/auth_service";
import { messageService } from "@/services/message_service";
import { BASE_URL, type MessageDTO } from "@/lib/types/database";

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

interface UseProjectChatResult {
  messages: ChatMessage[];
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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const keyPairRef = useRef<{ keyPair: CryptoKeyPair; publicKey: string } | null>(null);
  // peer userId -> derived AES-GCM key.
  const peerKeysRef = useRef<Map<string, CryptoKey>>(new Map());
  const pendingOffersRef = useRef<OfferIntent[]>([]);
  const historyRef = useRef<MessageDTO[]>([]);
  const hydratedPeersRef = useRef<Set<string>>(new Set());

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

  useEffect(() => {
    if (!projectId) return;

    let closed = false;
    const socket = new WebSocket(`${BASE_URL.replace(/^http/, "ws")}/ws`);
    wsRef.current = socket;

    const join = async () => {
      const user = authService.getCachedUser() ?? await authService.getCurrentUser();
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

    socket.onopen = () => void join();

    const hydrateHistoryFor = async (senderId: string, key: CryptoKey) => {
      if (hydratedPeersRef.current.has(senderId)) return;

      hydratedPeersRef.current.add(senderId);

      const decrypted = await Promise.all(
        historyRef.current.filter((row) => row.senderId === senderId).map((row) => toChatMessage(row, key)),
      );

      setMessages((prev) =>
        [...decrypted, ...prev].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      );
    };

    // REST history: encrypted rows are decrypted once peer keys are available.
    const loadHistory = async () => {
      try {
        const rows = await messageService.listByProject(projectId);
        historyRef.current = rows;

        for (const [peerId, key] of peerKeysRef.current) {
          await hydrateHistoryFor(peerId, key);
        }
      } catch {
        // History is best-effort; realtime still works.
      }
    };

    void loadHistory();

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
              await hydrateHistoryFor(peerId, shared);
            } catch {
              // Skip peers whose keys cannot be imported; messages fall back to plaintext.
            }
          }

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
            await hydrateHistoryFor(frame.userId, shared);
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
      hydratedPeersRef.current = new Set();
      setIsConnected(false);
    };
  }, [projectId, decryptFrom]);

  const encryptContent = useCallback(async (content: string): Promise<string> => {
    // Encrypt towards the first peer; both participants share the same secret.
    const peerKey = peerKeysRef.current.values().next().value as CryptoKey | undefined;
    if (!peerKey) return content;

    const { iv, ciphertext } = await encryptMessage(peerKey, content);

    return JSON.stringify({ iv, ciphertext });
  }, []);

  const sendMessage = useCallback((content: string) => {
    const socket = wsRef.current;
    const trimmed = content.trim();

    if (!socket || socket.readyState !== WebSocket.OPEN || !projectId || !trimmed) return;

    void (async () => {
      const payload = await encryptContent(trimmed);
      socket.send(JSON.stringify({ type: "message", projectId, content: payload } satisfies ClientFrame));
    })();
  }, [projectId, encryptContent]);

  const sendOffer = useCallback((content: string, offerDeadline: string) => {
    const socket = wsRef.current;
    const trimmed = content.trim();

    if (!socket || socket.readyState !== WebSocket.OPEN || !projectId || !trimmed || !offerDeadline) return;

    // Room key not ready yet: queue raw content; "joined" encrypts and flushes.
    if (peerKeysRef.current.size === 0) {
      pendingOffersRef.current.push({ content: trimmed, offerDeadline });
      return;
    }

    void (async () => {
      const payload = await encryptContent(trimmed);
      const frame: ClientFrame = { type: "offer", projectId, content: payload, offerDeadline };

      socket.send(JSON.stringify(frame));
    })();
  }, [projectId, encryptContent]);

  const respondToOffer = useCallback((messageId: string, offerStatus: "ACCEPTED" | "REJECTED") => {
    const socket = wsRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN || !projectId) return;

    socket.send(JSON.stringify({ type: "offer-response", projectId, messageId, offerStatus } satisfies ClientFrame));
  }, [projectId]);

  return {
    messages,
    isConnected,
    isEncrypted,
    error,
    sendMessage,
    sendOffer,
    respondToOffer,
  };
}
