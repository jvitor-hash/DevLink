import { useCallback, useState } from "react";

import { cache, CACHE_KEYS } from "@/utils/session_cache";
import { DEFAULT_TICKET_META, type TicketMeta, type TicketMetaMap } from "@/pages/project_open/ticket_board";

// Tags and priority have no column in the ticket table, so they live in local
// storage keyed by project. Moving them to the API is a drop-in swap: only this
// hook touches the extra fields.
export function useTicketMetadata(projectId: string, seed?: TicketMetaMap) {
  const storageKey = `${CACHE_KEYS.TICKET_META}:${projectId}`;

  const [metaMap, setMetaMap] = useState<TicketMetaMap>(() => {
    const stored = cache.get<TicketMetaMap>(storageKey) ?? {};

    return seed ? { ...seed, ...stored } : stored;
  });

  const getMeta = useCallback(
    (ticketId: string): TicketMeta => metaMap[ticketId] ?? DEFAULT_TICKET_META,
    [metaMap],
  );

  const setMeta = useCallback((ticketId: string, patch: Partial<TicketMeta>): void => {
    const next: TicketMetaMap = {
      ...metaMap,
      [ticketId]: { ...DEFAULT_TICKET_META, ...metaMap[ticketId], ...patch },
    };

    cache.set(storageKey, next);
    setMetaMap(next);
  }, [metaMap, storageKey]);

  return { metaMap, getMeta, setMeta };
}
