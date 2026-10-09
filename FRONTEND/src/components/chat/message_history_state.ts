import type { MessageDTO } from "@/data/types/database";

export type MessagePageLoader = (params: { conversationId: string; limit: number; offset: number }) => Promise<MessageDTO[]>;

export const retrieveMessagePage = async (loadPage: MessagePageLoader, conversationId: string, offset: number, limit = 20): Promise<MessageDTO[]> => {
  const messages = await loadPage({ conversationId, limit, offset });
  return Array.isArray(messages) ? messages : [];
};

export const appendUniqueMessages = (current: MessageDTO[], next: MessageDTO[]): MessageDTO[] => [
  ...current,
  ...next.filter((message) => !current.some((existing) => existing.id === message.id)),
];

export const clearMessagesOnConversationSwitch = (previousConversationId: string | null, nextConversationId: string | null, current: MessageDTO[]): MessageDTO[] => previousConversationId === nextConversationId ? current : [];
