import { describe, expect, test } from "bun:test";
import { describeEvent, eventToNotification, EVENT_TITLES } from "@/utils/notification_mapper";
import type { ProjectEvent } from "@/data/types/database";

const makeEvent = (overrides: Partial<ProjectEvent> = {}): ProjectEvent => ({
  id: "evt_1",
  type: "project.updated",
  aggregateType: "project",
  aggregateId: "proj_1",
  payload: {},
  ...overrides,
});

describe("Event Titles", () => {
  test("covers every streamed event type", () => {
    expect(EVENT_TITLES["project.saved"]).toBe("Projeto salvo");
    expect(EVENT_TITLES["project.updated"]).toBe("Projeto atualizado");
    expect(EVENT_TITLES["project.deleted"]).toBe("Projeto excluído");
  });
});

describe("describeEvent", () => {
  test("lists changed fields for update events", () => {
    const summary = describeEvent(makeEvent({ payload: { changes: { title: "Novo", status: "OPEN" } } }));

    expect(summary).toContain("title");
    expect(summary).toContain("status");
  });

  test("uses the project title from the payload when present", () => {
    const summary = describeEvent(makeEvent({ type: "project.saved", payload: { title: "Meu projeto" } }));

    expect(summary).toContain("Meu projeto");
  });

  test("falls back to the aggregate id", () => {
    const summary = describeEvent(makeEvent({ type: "project.deleted" }));

    expect(summary).toContain("proj_1");
  });
});

describe("eventToNotification", () => {
  test("maps the event to the list item view model", () => {
    const receivedAt = new Date().toISOString();
    const notification = eventToNotification(makeEvent(), receivedAt, false, true);

    expect(notification.id).toBe("evt_1");
    expect(notification.projectId).toBe("proj_1");
    expect(notification.type).toBe("SYSTEM");
    expect(notification.isRead).toBe(false);
    expect(notification.archived).toBe(true);
    expect(notification.createdAt).toBe(receivedAt);
    expect(notification.title).toBe("Projeto atualizado");
  });
});
