import type { ProjectActionAccepted, ProjectEvent } from "@/data/types/database";

export type MockProjectAction = "SAVE_PROJECT" | "UPDATE_PROJECT" | "DELETE_PROJECT";

// Simulates the API's 202 receipt without any network activity.
export const mockProjectAction = (_action: MockProjectAction, _payload: Record<string, unknown>): ProjectActionAccepted => ({
  actionId: crypto.randomUUID(),
  eventId: crypto.randomUUID(),
  status: "PENDING",
});

type MockListener = (event: ProjectEvent) => void;

type MockEventInput = {
  type?: ProjectEvent["type"];
  projectId?: string;
  payload?: Record<string, unknown>;
};

// Synthetic event source standing in for the SSE stream while the real
// flow is flag-gated off. Listeners are user-registered callbacks.
class MockProjectEventBus {
  private readonly listeners = new Set<MockListener>();

  private readonly history: ProjectEvent[] = [];

  subscribe(listener: MockListener): () => void {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  emit(input: MockEventInput = {}): ProjectEvent {
    const event: ProjectEvent = {
      id: crypto.randomUUID(),
      type: input.type ?? "project.updated",
      aggregateType: "project",
      aggregateId: input.projectId ?? crypto.randomUUID(),
      payload: { mocked: true, ...(input.payload ?? {}) },
    };

    this.history.push(event);
    this.trimHistory();

    for (const listener of this.listeners) listener(event);

    return event;
  }

  // Bounded history so the mock bus cannot grow unbounded in a long session.
  private trimHistory(): void {
    if (this.history.length > 100) this.history.splice(0, this.history.length - 100);
  }
}

export const mockProjectEventBus = new MockProjectEventBus();
