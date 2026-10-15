import { describe, expect, test, mock } from "bun:test";
import { projectService } from "@/data/services/project_service";

describe("Project Service", () => {
  test("saveProject sends POST request to /api/v1/projects/actions", async () => {
    const originalFetch = globalThis.fetch;
    let requestedUrl = "";
    let requestedOptions: RequestInit | undefined;

    globalThis.fetch = mock(async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      requestedUrl = String(url);
      requestedOptions = init;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    try {
      const result = await projectService.saveProject("project-123");

      expect(requestedUrl).toContain("/api/v1/projects/actions");
      expect(requestedOptions?.method).toBe("POST");

      const body = JSON.parse(requestedOptions?.body as string);

      expect(body).toEqual({
        type: "SAVE_PROJECT",
        payload: { projectId: "project-123" },
      });
      expect(result).toEqual({ success: true });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
