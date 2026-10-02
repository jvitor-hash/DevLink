import { useEffect, useRef, useState } from "react";
import { BASE_URL, type ProjectEvent, type ProjectEventType } from "@/data/types/database";
import { projectActionsEnabled } from "@/utils/feature_flags";
import { mockProjectEventBus } from "@/utils/mock_project_events";

export const PROJECT_EVENT_TYPES: readonly ProjectEventType[] = [
  "project.saved",
  "project.updated",
  "project.deleted",
];

// Pure helpers kept out of the hook so they are unit-testable without a browser.

export type RawProjectEvent = {
  id?: unknown;
  type?: unknown;
  aggregateType?: unknown;
  aggregateId?: unknown;
  payload?: unknown;
};

export const isProjectEventType = (value: unknown): value is ProjectEventType =>
  typeof value === "string" && (PROJECT_EVENT_TYPES as readonly string[]).includes(value);

// At-least-once delivery means the same event id can arrive more than once;
// the seen set dedupes, and projectId (when given) filters the stream.
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

type EventScope =
  // Only events about this project (projectId must be set).
  | "project"
  // Every event the API fans out to the signed-in user; the stream is already
  // audience-scoped server-side, so the aggregate id is not filtered.
  | "audience"
  // No subscription at all.
  | "inactive";

type UseProjectEventsOptions = {
  onEvent: (event: ProjectEvent) => void;
  scope?: EventScope;
};

// Subscribes to live project events while projectId is set. With the
// feature flag on it opens the API's SSE stream; with it off it listens
// to the local mock bus instead, so demos work without a backend.
export function useProjectEvents(
  projectId: string | null,
  options: UseProjectEventsOptions,
): boolean {
  const { onEvent, scope = "project" } = options;
  const [streamConnected, setStreamConnected] = useState<boolean>(false);
  const seenRef = useRef<Set<string>>(new Set());
  const onEventRef = useRef<(event: ProjectEvent) => void>(options.onEvent);

  const isActive = scope === "audience" || (scope === "project" && projectId !== null);
  const scopedProjectId = scope === "audience" ? null : projectId;

  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (!isActive) return;

    // Mock mode: no network, events come from the local bus.
    if (!projectActionsEnabled()) {
      const unsubscribe = mockProjectEventBus.subscribe((event) => {
        const accepted = acceptEvent(seenRef.current, event, scopedProjectId);

        if (accepted) onEventRef.current(accepted);
      });

      return () => {
        unsubscribe();
      };
    }

    const source = new EventSource(`${BASE_URL}/api/v1/events/stream`, { withCredentials: true });

    source.onopen = () => setStreamConnected(true);
    source.onerror = () => setStreamConnected(false);

    const handleMessage = (raw: string): void => {
      try {
        const parsed = JSON.parse(raw) as RawProjectEvent;
        const event = acceptEvent(seenRef.current, parsed, scopedProjectId);

        if (event) onEventRef.current(event);
      } catch {
        // Malformed frames are ignored; delivery is at-least-once elsewhere.
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

  // Nothing to watch means disconnected; in mock mode the bus is connected by definition.
  if (!isActive) return false;

  return !projectActionsEnabled() || streamConnected;
}
