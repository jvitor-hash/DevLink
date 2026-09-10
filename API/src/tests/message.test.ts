import { describe, expect, test } from "bun:test";
import {
  MessageCreateSchema,
  MessageUpdateSchema,
  MessageSchema,
} from "../database/data-transfer-object/message_dto";
import { MessageRouter } from "../routes/v1/message";

describe("Message Schema Validation", () => {
  test("MessageCreateSchema should validate message payload", () => {
    const validData = {
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      content: "Hello, this is a test message",
    };

    const result = MessageCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projectId).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(result.data.content).toBe("Hello, this is a test message");
    }
  });

  test("MessageCreateSchema should validate with default isRead", () => {
    const validData = {
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      content: "Message with default isRead",
    };

    const result = MessageCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isRead).toBe(false);
    }
  });

  test("MessageCreateSchema should reject empty content", () => {
    const invalidData = {
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      content: "",
    };

    const result = MessageCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("MessageCreateSchema should reject invalid project UUID", () => {
    const invalidData = {
      projectId: "invalid-uuid",
      content: "Test message",
    };

    const result = MessageCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("MessageCreateSchema should reject missing required fields", () => {
    const invalidData = {};

    const result = MessageCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("MessageUpdateSchema should accept partial updates", () => {
    const updateData = {
      content: "Updated message content",
    };

    const result = MessageUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("Updated message content");
    }
  });

  test("MessageUpdateSchema should accept isRead update", () => {
    const updateData = {
      isRead: true,
    };

    const result = MessageUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isRead).toBe(true);
    }
  });

  test("MessageUpdateSchema should accept empty update", () => {
    const emptyUpdate = {};

    const result = MessageUpdateSchema.safeParse(emptyUpdate);
    expect(result.success).toBe(true);
  });

  test("MessageSchema should validate full entity", () => {
    const fullMessage = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      projectId: "550e8400-e29b-41d4-a716-446655440001",
      senderId: "550e8400-e29b-41d4-a716-446655440002",
      content: "Full message content",
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = MessageSchema.safeParse(fullMessage);
    expect(result.success).toBe(true);
  });

  test("MessageSchema should validate entity with isRead true", () => {
    const readMessage = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      projectId: "550e8400-e29b-41d4-a716-446655440001",
      senderId: "550e8400-e29b-41d4-a716-446655440002",
      content: "Read message",
      isRead: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = MessageSchema.safeParse(readMessage);
    expect(result.success).toBe(true);
  });
});

describe("Message Route Definition", () => {
  test("MessageRouter is properly configured", () => {
    expect(MessageRouter).toBeDefined();
    expect(typeof MessageRouter.prefix).toBe("function");
  });
});
