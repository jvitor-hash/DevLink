import { describe, expect, test } from "bun:test";
import { MessageCreateSchema, MessageUpdateSchema, MessageSchema } from "../database/data-transfer-object/message_dto";

const conversationId = "550e8400-e29b-41d4-a716-446655440000";
const userId = "550e8400-e29b-41d4-a716-446655440001";

describe("Message Schema Validation", () => {
  test("validates a message create payload", () => {
    const result = MessageCreateSchema.safeParse({ conversationId, content: "Hello, this is a test message" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conversationId).toBe(conversationId);
      expect(result.data.content).toBe("Hello, this is a test message");
      expect(result.data.messageType).toBe("MESSAGE");
    }
  });

  test("defaults isRead and messageType", () => {
    const result = MessageCreateSchema.safeParse({ conversationId, content: "Message with defaults" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isRead).toBe(false);
      expect(result.data.messageType).toBe("MESSAGE");
    }
  });

  test("validates an offer payload", () => {
    const result = MessageCreateSchema.safeParse({
      conversationId,
      content: "Proposal",
      messageType: "OFFER",
      offerStatus: "PENDING",
      offerMoney: 1500,
      offerDeadline: "2026-12-31T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  test("rejects an invalid conversation UUID and empty content", () => {
    expect(MessageCreateSchema.safeParse({ conversationId: "invalid-uuid", content: "Test" }).success).toBe(false);
    expect(MessageCreateSchema.safeParse({ conversationId, content: "" }).success).toBe(false);
  });

  test("accepts partial updates without allowing readAt changes", () => {
    expect(MessageUpdateSchema.safeParse({ content: "Updated message", isRead: true }).success).toBe(true);
    const readAtUpdate = MessageUpdateSchema.safeParse({ readAt: new Date() });
    expect(readAtUpdate.success).toBe(true);
    if (readAtUpdate.success) expect(readAtUpdate.data.readAt).toBeUndefined();
  });

  test("validates a full message entity with readAt", () => {
    const result = MessageSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440002",
      conversationId,
      userId,
      content: "Read message",
      isRead: true,
      readAt: new Date(),
      messageType: "MESSAGE",
      offerStatus: null,
      offerMoney: null,
      offerDeadline: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result.success).toBe(true);
  });
});
