import type { ChatMessage } from "@/hooks/use_project_chat";

// Unseen offers: messages carrying a deadline that are still PENDING and that
// the client has not opened yet (isRead flips once the thread is viewed).
export const countUnseenOffers = (messages: ChatMessage[]): number =>
  messages.filter(
    (message) => message.offerDeadline !== null && message.offerStatus === "PENDING" && !message.isRead,
  ).length;

// Unseen pending offers per sender, for badges on the conversation list.
export const countUnseenOffersBySender = (messages: ChatMessage[]): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const message of messages) {
    if (message.offerDeadline === null || message.offerStatus !== "PENDING" || message.isRead) continue;

    counts.set(message.senderId, (counts.get(message.senderId) ?? 0) + 1);
  }

  return counts;
};
