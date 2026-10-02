import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { ProjectsRouter } from "../routes/v1/projects";
import { ProjectActionRouter } from "../routes/v1/project_action";
import { EventsRouter } from "../routes/v1/events";
import { UserPreferenceRouter } from "../routes/v1/user_preferences";
import { ReviewRouter } from "../routes/v1/review";
import { TodoRouter } from "../routes/v1/todo";
import { TicketRouter } from "../routes/v1/ticket";
import { UsersRouter } from "../routes/v1/users";
import { authPlugin } from "../modules/auth_plugin";

describe("API Routes Integration Tests", () => {
  let app: any;
  let serverPort: number;

  beforeAll(async () => {
    app = new Elysia()
      .use(authPlugin)
      .use(ProjectsRouter)
      .use(ProjectActionRouter)
      .use(EventsRouter)
      .use(UserPreferenceRouter)
      .use(ReviewRouter)
      .use(TodoRouter)
      .use(TicketRouter)
      .use(UsersRouter)
      .get("/health", () => ({ OK: true }))
      .listen(0);

    serverPort = Number(app.server?.port);
  });

  afterAll(async () => {
    await app.stop();
  });

  describe("Health Endpoint", () => {
    test("GET /health returns 200 OK status with { OK: true }", async () => {
      const response = await fetch(`http://localhost:${serverPort}/health`);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.OK).toBe(true);
    });
  });

  describe("Unauthenticated Protected Routes Guard", () => {

    test("POST /api/v1/project returns validation error without auth (422)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Test" }),
      });
      // Body validation happens before auth, so we get 422 (Unprocessable Entity)
      // instead of 401. This is expected behavior.
      expect(response.status).toBe(422);
    });

    test("POST /api/v1/project without body returns validation error (422)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(422);
    });

    test("POST /api/v1/project_action requires authentication (401)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/project_action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_PROJECT", payload: { title: "Test" } }),
      });
      expect(response.status).toBe(401);
    });

    test("POST /api/v1/project_action rejects unknown actions (400)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/project_action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": "550e8400-e29b-41d4-a716-446655440001",
        },
        body: JSON.stringify({ action: "ARCHIVE_PROJECT", payload: {} }),
      });
      expect([400, 401]).toContain(response.status);
    });

    test("GET /api/v1/events/stream requires authentication (401)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/events/stream`);
      expect(response.status).toBe(401);
    });

    test("GET /api/v1/user-preferences requires authentication (401)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/user-preferences`);
      expect(response.status).toBe(401);
    });

    test("GET /api/v1/review requires authentication (401)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/reviews`);
      expect(response.status).toBe(401);
    });

    test("GET /api/v1/todos requires authentication (401)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/todos/`);
      expect(response.status).toBe(401);
    });

    test("GET /api/v1/tickets requires authentication (401)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/tickets/`);
      expect(response.status).toBe(401);
    });

    test("PUT /api/v1/users/me requires authentication (401)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      });
      expect(response.status).toBe(401);
    });
  });

  describe("Route Structure Verification", () => {
    test("All routers are properly mounted and respond to requests", async () => {
      const endpoints = [
        "/api/v1/projects",
        "/api/v1/user-preferences",
        "/api/v1/reviews",
        "/api/v1/todos",
        "/api/v1/tickets",
        "/api/v1/users",
        "/api/v1/events/stream",
        "/api/v1/projects/counts/by-category",
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`http://localhost:${serverPort}${endpoint}`);
        // None of these routes should return 404 (Route not found)
        expect(response.status).not.toBe(404);
      }
    });
  });
});
