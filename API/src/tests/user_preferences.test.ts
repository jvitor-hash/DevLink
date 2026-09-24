import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import {
  UserPreferenceCreateSchema,
  UserPreferenceUpdateSchema,
  UserPreferenceSchema,
} from "../database/data-transfer-object/user_preferences_dto";
import { UserPreferenceRouter } from "../routes/v1/user_preferences";

describe("UserPreference Schema Validation", () => {
  test("UserPreferenceCreateSchema should validate correctly", () => {
    const validData = {
      email_notifications: true,
      message_notifications: false,
      project_notifications: true,
      review_notifications: true,
    };

    const result = UserPreferenceCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email_notifications).toBe(true);
      expect(result.data.message_notifications).toBe(false);
    }
  });

  test("UserPreferenceCreateSchema should apply defaults", () => {
    const emptyData = {};

    const result = UserPreferenceCreateSchema.safeParse(emptyData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email_notifications).toBe(true);
      expect(result.data.message_notifications).toBe(true);
      expect(result.data.project_notifications).toBe(true);
      expect(result.data.review_notifications).toBe(true);
    }
  });

  test("UserPreferenceUpdateSchema should accept partial updates", () => {
    const updateData = {
      email_notifications: false,
    };

    const result = UserPreferenceUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email_notifications).toBe(false);
      // In partial schema, unspecified fields get their default values
      expect(result.data.message_notifications).toBe(true);
      expect(result.data.project_notifications).toBe(true);
      expect(result.data.review_notifications).toBe(true);
    }
  });

  test("UserPreferenceUpdateSchema should accept empty update", () => {
    const emptyUpdate = {};

    const result = UserPreferenceUpdateSchema.safeParse(emptyUpdate);
    expect(result.success).toBe(true);
  });

  test("UserPreferenceUpdateSchema should accept full update", () => {
    const fullUpdate = {
      email_notifications: false,
      message_notifications: false,
      project_notifications: false,
      review_notifications: false,
    };

    const result = UserPreferenceUpdateSchema.safeParse(fullUpdate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email_notifications).toBe(false);
      expect(result.data.message_notifications).toBe(false);
      expect(result.data.project_notifications).toBe(false);
      expect(result.data.review_notifications).toBe(false);
    }
  });

  test("UserPreferenceSchema should validate full entity", () => {
    const fullPreference = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      email_notifications: true,
      message_notifications: true,
      project_notifications: true,
      review_notifications: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = UserPreferenceSchema.safeParse(fullPreference);
    expect(result.success).toBe(true);
  });
});

describe("UserPreference By-User Routes", () => {
  let app: any;
  let serverPort: number;

  beforeAll(async () => {
    const { Elysia } = await import("elysia");
    const { authPlugin } = await import("../modules/auth_plugin");

    app = new Elysia()
      .use(authPlugin)
      .use(UserPreferenceRouter)
      .listen(0);

    serverPort = Number(app.server?.port);
  });

  afterAll(async () => {
    await app.stop();
  });

  test("PUT /api/v1/user-preferences/:userId requires authentication (401)", async () => {
    const response = await fetch(`http://localhost:${serverPort}/api/v1/user-preferences/550e8400-e29b-41d4-a716-446655440001`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_notifications: false }),
    });
    expect(response.status).toBe(401);
  });

  test("GET /api/v1/user-preferences/user/:userId requires authentication (401)", async () => {
    const response = await fetch(`http://localhost:${serverPort}/api/v1/user-preferences/user/550e8400-e29b-41d4-a716-446655440001`);
    expect(response.status).toBe(401);
  });
});

describe("UserPreference Route Definition", () => {
  test("UserPreferenceRouter is properly configured", () => {
    expect(UserPreferenceRouter).toBeDefined();
    expect(typeof UserPreferenceRouter.prefix).toBe("function");
  });
});
