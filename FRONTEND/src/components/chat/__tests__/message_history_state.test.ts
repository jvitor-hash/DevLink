import { describe, expect, test } from "bun:test";
import { appendUniqueMessages, clearMessagesOnConversationSwitch, retrieveMessagePage } from "../message_history_state";
import type { MessageDTO } from "@/data/types/database";

const message = (id: string): MessageDTO => ({
  id,
  conversationId: "conversation-1",
  userId: "user-1",
  content: id,
  isRead: false,
  messageType: "MESSAGE",
});

describe("message history state", () => {
  test("retrieves a page using the conversation id and offset", async () => {
    const calls: Array<{ conversationId: string; limit: number; offset: number }> = [];
    const result = await retrieveMessagePage(async (params) => { calls.push(params); return [message("message-21")]; }, "conversation-1", 20);

    expect(calls).toEqual([{ conversationId: "conversation-1", limit: 20, offset: 20 }]);
    expect(result.map((item) => item.id)).toEqual(["message-21"]);
  });

  test("appends new messages without duplicating messages already loaded", () => {
    const result = appendUniqueMessages([message("message-1")], [message("message-1"), message("message-2")]);

    expect(result.map((item) => item.id)).toEqual(["message-1", "message-2"]);
  });

  test("clears messages only when the conversation changes", () => {
    const current = [message("message-1")];

    expect(clearMessagesOnConversationSwitch("conversation-1", "conversation-1", current)).toBe(current);
    expect(clearMessagesOnConversationSwitch("conversation-1", "conversation-2", current)).toEqual([]);
  });
});
