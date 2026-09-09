import { describe, expect, test } from "bun:test";
import {
  NotificationCreateSchema,
  NotificationUpdateSchema,
  NotificationSchema,
} from "../database/data-transfer-object/notification_dto";
import { NotificationRouter } from "../routes/v1/notification";

describe("Notification Schema Validation", () => {
  test("NotificationCreateSchema should validate correctly with real types", () => {
    const validData = {
      type: "PROJECT_UPDATE" as const,
      title: "Project Milestone Reached",
      message: "Milestone 1 has been approved by the client.",
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      isRead: false,
    };

    const result = NotificationCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("PROJECT_UPDATE");
      expect(result.data.isRead).toBe(false);
    }
  });

  test("NotificationCreateSchema should reject empty title", () => {
    const invalidData = {
      type: "SYSTEM" as const,
      title: "",
      message: "System maintenance tonight.",
    };

    const result = NotificationCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("NotificationCreateSchema should reject invalid notification type", () => {
    const invalidData = {
      type: "UNKNOWN_TYPE" as any,
      title: "Notice",
      message: "Message body",
    };

    const result = NotificationCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("NotificationUpdateSchema should accept partial updates", () => {
    const updateData = {
      isRead: true,
    };

    const result = NotificationUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });

  test("NotificationSchema should validate full entity", () => {
    const fullNotification = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      type: "NEW_MESSAGE" as const,
      title: "New Message Received",
      message: "You have a new message from Alice.",
      projectId: null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const result = NotificationSchema.safeParse(fullNotification);
    expect(result.success).toBe(true);
  });
});

describe("Notification Route Definition", () => {
  test("NotificationRouter is properly configured", () => {
    expect(NotificationRouter).toBeDefined();
    expect(NotificationRouter.prefix).toBe("/api/v1/notifications");
  });
});
