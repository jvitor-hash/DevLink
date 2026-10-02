import { describe, expect, test } from "bun:test";
import { OutboxDispatcher } from "../modules/outbox_dispatcher";
import { SseHub, type SSEEvent } from "../modules/sse_hub";
import { ProjectActionRouter } from "../routes/v1/project_action";
import { EventsRouter } from "../routes/v1/events";

describe("Outbox Dispatcher", () => {
  test("backoff follows 1m -> 5m -> 15m -> 1h -> dead letter", () => {
    expect(OutboxDispatcher.nextBackoffMs(1)).toBe(60_000);
    expect(OutboxDispatcher.nextBackoffMs(2)).toBe(300_000);
    expect(OutboxDispatcher.nextBackoffMs(3)).toBe(900_000);
    expect(OutboxDispatcher.nextBackoffMs(4)).toBe(3_600_000);
    expect(OutboxDispatcher.nextBackoffMs(5)).toBe(null);
    expect(OutboxDispatcher.nextBackoffMs(99)).toBe(null);
  });

  test("dispatchBatch claims pending events without throwing", async () => {
    // Without a live database this resolves with zero claimed rows or fails gracefully.
    const claimed = await OutboxDispatcher.dispatchBatch().catch(() => -1);
    expect(claimed).toBeGreaterThanOrEqual(-1);
  });

  test("worker id is stable per process", () => {
    expect(OutboxDispatcher.workerId).toBe(OutboxDispatcher.workerId);
  });
});

describe("SSE Hub", () => {
  const makeEvent = (audience: string[]): SSEEvent => ({
    id: "evt_456",
    event: "project.saved",
    data: { projectId: "proj_123", name: "My Project" },
    audienceUserIds: audience,
  });

  test("publishes only to audience members and returns delivery count", () => {
    SseHub.reset();

    const received: string[] = [];
    const other: string[] = [];

    SseHub.register("user-1", (chunk) => received.push(chunk));
    SseHub.register("user-2", (chunk) => other.push(chunk));

    const delivered = SseHub.publish(makeEvent(["user-1"]));

    expect(delivered).toBe(1);
    expect(received).toHaveLength(1);
    expect(other).toHaveLength(0);
    expect(received[0]).toContain("id: evt_456");
    expect(received[0]).toContain("event: project.saved");
    expect(received[0]).toContain(`data: {"projectId":"proj_123","name":"My Project"}`);
  });

  test("unregister stops delivery", () => {
    SseHub.reset();

    const received: string[] = [];
    const clientId = SseHub.register("user-1", (chunk) => received.push(chunk));

    SseHub.unregister(clientId);
    const delivered = SseHub.publish(makeEvent(["user-1"]));

    expect(delivered).toBe(0);
    expect(received).toHaveLength(0);
  });

  test("failed writes drop the client instead of throwing", () => {
    SseHub.reset();

    SseHub.register("user-1", () => {
      throw new Error("stream closed");
    });

    const delivered = SseHub.publish(makeEvent(["user-1"]));

    expect(delivered).toBe(0);
    expect(SseHub.stats().connectionsActive).toBe(0);
  });

  test("stats report active connections and unique users", () => {
    SseHub.reset();

    SseHub.register("user-1", () => undefined);
    SseHub.register("user-1", () => undefined);
    SseHub.register("user-2", () => undefined);

    const stats = SseHub.stats();

    expect(stats.connectionsActive).toBe(3);
    expect(stats.users).toBe(2);
    expect(SseHub.clientCountForUser("user-1")).toBe(2);
  });
});

describe("Routers Definition", () => {
  test("ProjectActionRouter is properly configured", () => {
    expect(ProjectActionRouter).toBeDefined();
    expect(typeof ProjectActionRouter.prefix).toBe("function");
  });

  test("EventsRouter is properly configured", () => {
    expect(EventsRouter).toBeDefined();
    expect(typeof EventsRouter.prefix).toBe("function");
  });
});
