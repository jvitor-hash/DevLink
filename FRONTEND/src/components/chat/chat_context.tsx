import { createContext, useContext, useState, type ReactNode } from "react";

type ChatContextValue = { conversationId: string | null; selectConversation: (id: string | null) => void; close: () => void };
const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children, close }: { children: ReactNode; close: () => void }) {
  const [conversationId, selectConversation] = useState<string | null>(null);
  return <ChatContext.Provider value={{ conversationId, selectConversation, close }}>{children}</ChatContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used inside ChatProvider");
  return context;
}
