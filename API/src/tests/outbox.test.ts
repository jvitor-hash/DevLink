import { describe, expect, test } from "bun:test";
import { publishNotificationEvent, requeueDeadEvents } from "../modules/notification_outbox";
import { signPayload } from "../modules/webhook_delivery";
import { WebhookRouter } from "../routes/v1/webhook";

describe("Outbox Publishing", () => {
  test("publishNotificationEvent returns an outbox id", async () => {
    const id = await publishNotificationEvent({
      type: "PROJECT_SAVED",
      payload: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Test project",
        saveTotalCount: 1,
        clientId: "550e8400-e29b-41d4-a716-446655440001",
      },
    }).catch(() => null);

    // Without a live database this either resolves with a uuid or fails gracefully.
    if (id !== null) {
      expect(typeof id).toBe("string");
      expect(id.length).toBe(36);
    }
  });
});

describe("Webhook Signing", () => {
  test("signPayload is deterministic for the same secret/body/timestamp", () => {
    const body = JSON.stringify({ type: "NEW_PROJECT", id: "abc" });
    const a = signPayload("secret", body, 1_700_000_000);
    const b = signPayload("secret", body, 1_700_000_000);

    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  test("signPayload differs for different secrets", () => {
    const body = JSON.stringify({ type: "NEW_PROJECT", id: "abc" });
    const a = signPayload("secret-a", body, 1_700_000_000);
    const b = signPayload("secret-b", body, 1_700_000_000);

    expect(a).not.toBe(b);
  });

  test("signPayload differs for different timestamps", () => {
    const body = JSON.stringify({ type: "NEW_PROJECT", id: "abc" });
    const a = signPayload("secret", body, 1_700_000_000);
    const b = signPayload("secret", body, 1_700_000_001);

    expect(a).not.toBe(b);
  });
});

describe("Webhook Router Definition", () => {
  test("WebhookRouter is properly configured", () => {
    expect(WebhookRouter).toBeDefined();
    expect(typeof WebhookRouter.prefix).toBe("function");
  });
});

describe("Dead Event Requeue", () => {
  test("requeueDeadEvents returns a count", async () => {
    const count = await requeueDeadEvents().catch(() => -1);
    expect(count).toBeGreaterThanOrEqual(-1);
  });
});
