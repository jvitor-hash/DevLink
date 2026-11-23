import { useCallback, useState } from "react";
import { sessionCache } from "@/shared/utils/session_cache";
import { DEFAULT_TICKET_META, type TicketMeta, type TicketMetaMap } from "../types/ticket_board";

const STORAGE_PREFIX = "ticket_meta_";

export function useTicketMetadata(projectId: string, seed?: TicketMetaMap) {
  const storageKey = `${STORAGE_PREFIX}${projectId}`;

  const [metaMap, setMetaMap] = useState<TicketMetaMap>(() => {
    const stored = sessionCache.read<TicketMetaMap>(storageKey);
    return stored ? { ...seed, ...stored } : seed ?? {};
  });

  const getMeta = useCallback(
    (ticketId: string): TicketMeta => metaMap[ticketId] ?? DEFAULT_TICKET_META,
    [metaMap]
  );

  const setMeta = useCallback(
    (ticketId: string, patch: Partial<TicketMeta>): void => {
      setMetaMap((prev) => {
        const next: TicketMetaMap = {
          ...prev,
          [ticketId]: { ...DEFAULT_TICKET_META, ...prev[ticketId], ...patch },
        };
        sessionCache.write(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  return { metaMap, getMeta, setMeta };
}
