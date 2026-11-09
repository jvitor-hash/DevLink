import { describe, expect, test } from "bun:test";
import { acceptEvent, isProjectEventType, type RawProjectEvent } from "@/hooks/use_project_events";

const makeEvent = (overrides: Partial<RawProjectEvent> = {}): RawProjectEvent => ({
  id: "evt_456",
  type: "project.saved",
  aggregateType: "project",
  aggregateId: "proj_123",
  payload: { title: "My Project" },
  ...overrides,
});

describe("Project Event Type Guard", () => {
  test("accepts the three streamed event types", () => {
    expect(isProjectEventType("project.saved")).toBe(true);
    expect(isProjectEventType("project.updated")).toBe(true);
    expect(isProjectEventType("project.deleted")).toBe(true);
  });

  test("rejects unknown or malformed types", () => {
    expect(isProjectEventType("project.archived")).toBe(false);
    expect(isProjectEventType(42)).toBe(false);
    expect(isProjectEventType(undefined)).toBe(false);
  });
});

describe("Event Dedupe And Filtering", () => {
  test("accepts a new event and normalizes it", () => {
    const seen = new Set<string>();
    const event = acceptEvent(seen, makeEvent(), null);

    expect(event).not.toBeNull();
    expect(event?.id).toBe("evt_456");
    expect(event?.type).toBe("project.saved");
    expect(event?.aggregateId).toBe("proj_123");
  });

  test("dedupes repeated event ids", () => {
    const seen = new Set<string>();

    expect(acceptEvent(seen, makeEvent(), null)).not.toBeNull();
    expect(acceptEvent(seen, makeEvent(), null)).toBeNull();
  });

  test("drops events for other projects", () => {
    const seen = new Set<string>();

    expect(acceptEvent(seen, makeEvent({ aggregateId: "proj_other" }), "proj_123")).toBeNull();
    expect(acceptEvent(seen, makeEvent(), "proj_123")).not.toBeNull();
  });

  test("drops malformed frames", () => {
    const seen = new Set<string>();

    expect(acceptEvent(seen, makeEvent({ id: undefined }), null)).toBeNull();
    expect(acceptEvent(seen, makeEvent({ type: "weird" }), null)).toBeNull();
    expect(acceptEvent(seen, makeEvent({ aggregateId: "" }), null)).toBeNull();
  });

  test("caps the seen set to bound memory", () => {
    const seen = new Set<string>();

    for (let i = 0; i < 600; i++) {
      acceptEvent(seen, makeEvent({ id: `evt_${i}` }), null);
    }

    expect(seen.size).toBeLessThanOrEqual(500);
  });
});
