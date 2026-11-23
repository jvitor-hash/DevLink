import { ConversationItem } from "./conversation_item";
import type { ConversationDTO } from "@/shared/types/database";

interface ConversationListProps {
  conversations: ConversationDTO[];
  activeId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  loading = false,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="p-4 text-xs text-(--text-muted) text-center">
        Carregando conversas...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-xs text-(--text-muted) italic text-center">
        Nenhuma conversa aberta.
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {conversations.map((c) => (
        <ConversationItem
          key={c.id}
          conversation={c}
          isActive={c.id === activeId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
