import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "@/shared/lib/environment";
import type { ProjectEvent, ProjectEventType } from "@/shared/types/database";

export const PROJECT_EVENT_TYPES: readonly ProjectEventType[] = [
  "project.saved",
  "project.updated",
  "project.deleted",
];

export type RawProjectEvent = {
  id?: unknown;
  type?: unknown;
  aggregateType?: unknown;
  aggregateId?: unknown;
  payload?: unknown;
};

export const isProjectEventType = (value: unknown): value is ProjectEventType =>
  typeof value === "string" && (PROJECT_EVENT_TYPES as readonly string[]).includes(value as ProjectEventType);

export const acceptEvent = (
  seen: Set<string>,
  raw: RawProjectEvent,
  projectId: string | null,
): ProjectEvent | null => {
  const { id, type, aggregateId, payload } = raw;

  if (typeof id !== "string" || id.length === 0) return null;
  if (!isProjectEventType(type)) return null;
  if (typeof aggregateId !== "string" || aggregateId.length === 0) return null;
  if (seen.has(id)) return null;
  if (projectId !== null && aggregateId !== projectId) return null;

  if (seen.size >= 500) {
    for (const old of seen) {
      seen.delete(old);
      if (seen.size < 250) break;
    }
  }
  seen.add(id);

  return {
    id,
    type,
    aggregateType: typeof raw.aggregateType === "string" ? raw.aggregateType : "project",
    aggregateId,
    payload: (payload ?? {}) as Record<string, unknown>,
  };
};

type UseProjectEventsOptions = {
  onEvent: (event: ProjectEvent) => void;
  scope?: "project" | "global";
};

export function useProjectEvents(projectId: string | null, options: UseProjectEventsOptions): boolean {
  const { onEvent, scope = "project" } = options;
  const [streamConnected, setStreamConnected] = useState<boolean>(false);
  const seenRef = useRef<Set<string>>(new Set());
  const onEventRef = useRef<(event: ProjectEvent) => void>(options.onEvent);

  const isActive = scope === "global" || (scope === "project" && projectId !== null);
  const scopedProjectId = scope === "global" ? null : projectId;

  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (!isActive) return;

    const source = new EventSource(`${BASE_URL}/api/v1/events/stream`, { withCredentials: true });

    source.onopen = () => setStreamConnected(true);
    source.onerror = () => setStreamConnected(false);

    const handleMessage = (raw: string): void => {
      try {
        const parsed = JSON.parse(raw) as RawProjectEvent;
        const event = acceptEvent(seenRef.current, parsed, scopedProjectId);
        if (event) onEventRef.current(event);
      } catch {
        // ignore malformed
      }
    };

    for (const type of PROJECT_EVENT_TYPES) {
      source.addEventListener(type, (message) => handleMessage((message as MessageEvent<string>).data));
    }

    return () => {
      source.close();
      setStreamConnected(false);
    };
  }, [isActive, scopedProjectId]);

  if (!isActive) return false;

  return streamConnected;
}
