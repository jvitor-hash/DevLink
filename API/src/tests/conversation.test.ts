import { describe, expect, test } from "bun:test";
import { ConversationCreateSchema, ConversationSchema, ConversationUpdateSchema } from "../database/data-transfer-object/conversation_dto";

const conversation = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  projectId: "550e8400-e29b-41d4-a716-446655440001",
  userId: "550e8400-e29b-41d4-a716-446655440002",
  recipientId: "550e8400-e29b-41d4-a716-446655440003",
  lastMessage: "Hello",
  unreadMessages: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Conversation Schema Validation", () => {
  test("validates a conversation entity", () => {
    expect(ConversationSchema.safeParse(conversation).success).toBe(true);
  });

  test("requires project and participant identifiers when creating", () => {
    expect(ConversationCreateSchema.safeParse({ projectId: conversation.projectId, userId: conversation.userId, recipientId: conversation.recipientId }).success).toBe(true);
    expect(ConversationCreateSchema.safeParse({ projectId: conversation.projectId, recipientId: conversation.recipientId }).success).toBe(false);
  });

  test("defaults unreadMessages to zero", () => {
    const result = ConversationCreateSchema.safeParse({ projectId: conversation.projectId, userId: conversation.userId, recipientId: conversation.recipientId });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.unreadMessages).toBe(0);
  });

  test("accepts partial conversation updates", () => {
    expect(ConversationUpdateSchema.safeParse({ lastMessage: "Updated" }).success).toBe(true);
    expect(ConversationUpdateSchema.safeParse({ unreadMessages: 2 }).success).toBe(true);
  });
});
