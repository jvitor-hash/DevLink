import { useEffect, useState, type ReactNode } from "react";
import { X } from "react-feather";
import { conversationService } from "@/data/services/conversation_service";
import { useChat } from "./chat_context";

export type Conversation = {
  id: string;
  userId?: string;
  recipientId?: string;
  lastMessage?: string;
};

type ConversationHistoryProps = { projectId?: string; };

export default function ConversationHistory({ projectId }: ConversationHistoryProps): ReactNode {
  const { selectConversation, close, conversationId } = useChat(); const [conversations, setConversations] = useState<Conversation[]>([]);
  useEffect(() => {
    if (!projectId) return;
    const load = async (): Promise<void> => {
      try {
        const result = await conversationService.list({ projectId }) as Conversation[];
        setConversations(Array.isArray(result) ? result : []);
      } catch {
        setConversations([]);
      }
    };
    void load();
  }, [projectId, conversationId]);
  return (
    <div className="flex-2 border-r border-(--border-subtle)">
      <header className="flex p-3 justify-between items-center border-b border-(--border-subtle)">
        <p className="text-(--text-primary) text-base">Chat Conversations</p>
        <button className="border-none cursor-pointer hover:bg-(--surface-3)/95 p-1 transition-colors" onClick={close}><X size={16} color="var(--text-primary)" /></button>
      </header>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {conversations.length === 0 && <div className="p-4 text-sm text-(--text-muted) text-center">No conversations yet.</div>}
        {conversations.map((conversation) => {
          const otherUserId = conversation.userId ?? conversation.recipientId ?? "";
          return <div data-testid="conversation-item" key={conversation.id} className="p-2 hover:bg-(--surface-3)/95 cursor-pointer transition-colors" onClick={() => selectConversation(conversation.id)}>
            <h5 className="text-sm text-(--text-primary)">{otherUserId}</h5>
            <p className="text-sm text-(--text-muted)">{conversation.lastMessage}</p>
          </div>;
        })}
      </div>
    </div>
  );
}
