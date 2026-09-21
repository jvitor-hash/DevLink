import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { ProjectsRouter } from "../routes/v1/projects";
import { NotificationRouter } from "../routes/v1/notification";
import { MessageRouter } from "../routes/v1/message";
import { UserPreferenceRouter } from "../routes/v1/user_preferences";
import { SavedTicketRouter } from "../routes/v1/saved_ticket";
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
      .use(NotificationRouter)
      .use(MessageRouter)
      .use(UserPreferenceRouter)
      .use(SavedTicketRouter)
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

    test("GET /api/v1/notification requires authentication (401)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/notifications`);
      expect(response.status).toBe(401);
    });

    test("GET /api/v1/messages requires authentication (401)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/messages`);
      expect(response.status).toBe(401);
    });

    test("GET /api/v1/user-preferences requires authentication (401)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/user-preferences`);
      expect(response.status).toBe(401);
    });

    test("GET /api/v1/saved-tickets requires authentication (401)", async () => {
      const response = await fetch(`http://localhost:${serverPort}/api/v1/saved-tickets`);
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
        "/api/v1/notifications",
        "/api/v1/messages",
        "/api/v1/user-preferences",
        "/api/v1/saved-tickets",
        "/api/v1/reviews",
        "/api/v1/todos",
        "/api/v1/tickets",
        "/api/v1/users",
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
