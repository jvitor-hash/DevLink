import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { EventsRouter } from "../routes/v1/events";
import { authPlugin } from "../modules/auth_plugin";

describe("SSE Stream Endpoint", () => {
  test("requires authentication (401) without a session", async () => {
    const app = new Elysia()
      .use(authPlugin)
      .use(EventsRouter)
      .listen(0);

    const response = await app.handle(new Request(`http://localhost:${app.server?.port}/api/v1/events/stream`));

    expect(response.status).toBe(401);

    await app.stop();
  });
});
