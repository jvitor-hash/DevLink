import { describe, expect, test, mock } from "bun:test";
import { notificationService } from "@/data/services/notification_service";

describe("Notification Service", () => {
  test("list sends GET request to /api/v1/notifications", async () => {
    const originalFetch = globalThis.fetch;
    let requestedUrl = "";

    globalThis.fetch = mock(async (url: string | URL | Request): Promise<Response> => {
      requestedUrl = String(url);

      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    try {
      const result = await notificationService.list();

      expect(requestedUrl).toContain("/api/v1/notifications");
      expect(result).toEqual([]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("markAsRead sends PUT request to /api/v1/notifications/:id with isRead: true", async () => {
    const originalFetch = globalThis.fetch;
    let requestedUrl = "";
    let requestedOptions: RequestInit | undefined;

    globalThis.fetch = mock(async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      requestedUrl = String(url);
      requestedOptions = init;

      return new Response(JSON.stringify({ id: "notif-1", isRead: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    try {
      const result = await notificationService.markAsRead("notif-1");

      expect(requestedUrl).toContain("/api/v1/notifications/notif-1");
      expect(requestedOptions?.method).toBe("PUT");

      const body = JSON.parse(requestedOptions?.body as string);

      expect(body).toEqual({ isRead: true });
      expect(result.isRead).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("archive sends PUT request with archived: true", async () => {
    const originalFetch = globalThis.fetch;
    let requestedUrl = "";
    let requestedOptions: RequestInit | undefined;

    globalThis.fetch = mock(async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      requestedUrl = String(url);
      requestedOptions = init;

      return new Response(JSON.stringify({ id: "notif-2", archived: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    try {
      const result = await notificationService.archive("notif-2");

      expect(requestedUrl).toContain("/api/v1/notifications/notif-2");
      expect(requestedOptions?.method).toBe("PUT");

      const body = JSON.parse(requestedOptions?.body as string);

      expect(body).toEqual({ archived: true });
      expect(result.archived).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
