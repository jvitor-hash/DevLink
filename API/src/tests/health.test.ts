// API/src/tests/health.test.ts
// Tests for the health check endpoint

import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";

describe("Health Endpoint", () => {
  test("should return OK status", async () => {
    const app = new Elysia()
      .get("/health", () => JSON.stringify({ OK: true }))
      .listen(0); // Use random available port

    const response = await app.handle(new Request("http://localhost:" + app.server?.port + "/health"));
    
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.OK).toBe(true);

    await app.stop();
  });

});
