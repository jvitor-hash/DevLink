import { describe, expect, test } from "bun:test";

import { countUnseenOffers, countUnseenOffersBySender } from "@/utils/chat_metrics";
import type { ChatMessage } from "@/hooks/use_project_chat";

const offer = (
  id: string,
  senderId: string,
  offerStatus: "PENDING" | "ACCEPTED" | "REJECTED" | null,
  isRead = false,
): ChatMessage => ({
  id,
  senderId,
  content: "proposta",
  isRead,
  offerDeadline: offerStatus ? "2026-12-31T00:00:00.000Z" : null,
  offerStatus,
  createdAt: "2026-09-30T12:00:00.000Z",
  pending: false,
});

const plain = (id: string, senderId: string, isRead = false): ChatMessage => ({
  id,
  senderId,
  content: "mensagem",
  isRead,
  offerDeadline: null,
  offerStatus: null,
  createdAt: "2026-09-30T12:00:00.000Z",
  pending: false,
});

describe("Chat Metrics", () => {
  test("counts only pending and unread offers", () => {
    const messages = [
      plain("m1", "p1"),
      offer("m2", "p1", "PENDING"),
      offer("m3", "p2", "PENDING", true),
      offer("m4", "p2", "ACCEPTED"),
      offer("m5", "p3", "REJECTED", true),
      offer("m6", "p4", "PENDING"),
    ];

    expect(countUnseenOffers(messages)).toBe(2);
  });

  test("returns zero for conversations without unseen offers", () => {
    expect(countUnseenOffers([plain("m1", "p1"), offer("m2", "p2", "PENDING", true)])).toBe(0);
    expect(countUnseenOffers([])).toBe(0);
  });

  test("groups unseen pending offers per sender", () => {
    const messages = [
      offer("m1", "p1", "PENDING"),
      offer("m2", "p1", "PENDING"),
      offer("m3", "p1", "PENDING", true),
      offer("m4", "p2", "PENDING"),
      offer("m5", "p2", "ACCEPTED"),
    ];

    const counts = countUnseenOffersBySender(messages);

    expect(counts.get("p1")).toBe(2);
    expect(counts.get("p2")).toBe(1);
    expect(counts.has("p3")).toBe(false);
  });

  test("seen offers leave the count even while still pending", () => {
    const messages = [offer("m1", "p1", "PENDING"), offer("m2", "p1", "PENDING", true)];

    expect(countUnseenOffers(messages)).toBe(1);
    expect(countUnseenOffersBySender(messages).get("p1")).toBe(1);
  });
});
