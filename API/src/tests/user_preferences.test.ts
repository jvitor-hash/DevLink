import { describe, expect, test } from "bun:test";
import {
  UserPreferenceCreateSchema,
  UserPreferenceUpdateSchema,
  UserPreferenceSchema,
} from "../database/data-transfer-object/user_preferences_dto";
import { UserPreferenceRouter } from "../routes/v1/user_preferences";

describe("UserPreference Schema Validation", () => {
  test("UserPreferenceCreateSchema should validate correctly", () => {
    const validData = {
      emailNotifications: true,
      messageNotifications: false,
      projectNotifications: true,
      reviewNotifications: true,
    };

    const result = UserPreferenceCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.emailNotifications).toBe(true);
      expect(result.data.messageNotifications).toBe(false);
    }
  });

  test("UserPreferenceCreateSchema should apply defaults", () => {
    const emptyData = {};

    const result = UserPreferenceCreateSchema.safeParse(emptyData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.emailNotifications).toBe(true);
      expect(result.data.messageNotifications).toBe(true);
      expect(result.data.projectNotifications).toBe(true);
      expect(result.data.reviewNotifications).toBe(true);
    }
  });

  test("UserPreferenceUpdateSchema should accept partial updates", () => {
    const updateData = {
      emailNotifications: false,
    };

    const result = UserPreferenceUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.emailNotifications).toBe(false);
      expect(result.data.messageNotifications).toBeUndefined();
    }
  });

  test("UserPreferenceSchema should validate full entity", () => {
    const fullPreference = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      emailNotifications: true,
      messageNotifications: true,
      projectNotifications: true,
      reviewNotifications: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = UserPreferenceSchema.safeParse(fullPreference);
    expect(result.success).toBe(true);
  });
});

describe("UserPreference Route Definition", () => {
  test("UserPreferenceRouter is properly configured", () => {
    expect(UserPreferenceRouter).toBeDefined();
    expect(UserPreferenceRouter.prefix).toBe("/api/v1/user-preferences");
  });
});
