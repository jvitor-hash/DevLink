import { describe, expect, test } from "bun:test";
import { toastStore } from "@/utils/toast_store";
import { mockProjectAction, mockProjectEventBus } from "@/utils/mock_project_events";

describe("Toast Store", () => {
  test("show adds a toast and dismiss removes it", () => {
    const before = toastStore.getToasts().length;
    const id = toastStore.show("info", "Hello test");

    expect(toastStore.getToasts().length).toBe(before + 1);
    expect(toastStore.getToasts().some((toast) => toast.id === id)).toBe(true);

    toastStore.dismiss(id);

    expect(toastStore.getToasts().some((toast) => toast.id === id)).toBe(false);
  });

  test("dismiss is a no-op for unknown ids", () => {
    const before = toastStore.getToasts().length;

    toastStore.dismiss("no-such-id");

    expect(toastStore.getToasts().length).toBe(before);
  });
});

describe("Mock Project Actions", () => {
  test("mockProjectAction returns a PENDING receipt without network", () => {
    const receipt = mockProjectAction("SAVE_PROJECT", { title: "Test" });

    expect(receipt.status).toBe("PENDING");
    expect(receipt.actionId).toHaveLength(36);
    expect(receipt.eventId).toHaveLength(36);
  });

  test("emitted mock events reach every subscriber exactly once", () => {
    const received: string[] = [];
    const unsubscribe = mockProjectEventBus.subscribe((event) => received.push(event.id));

    const event = mockProjectEventBus.emit({ type: "project.saved", projectId: "proj_1" });

    unsubscribe();

    expect(received).toEqual([event.id]);
    expect(event.aggregateId).toBe("proj_1");
    expect(event.type).toBe("project.saved");
  });

  test("unsubscribed listeners receive nothing", () => {
    const received: string[] = [];

    mockProjectEventBus.emit({ type: "project.updated", projectId: "proj_2" });

    expect(received).toHaveLength(0);
  });
});
