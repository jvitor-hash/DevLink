import type { ConversationDTO } from "@/shared/types/database";

interface ConversationItemProps {
  conversation: ConversationDTO;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
}: ConversationItemProps) {
  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={`p-3 border-b border-(--border-subtle) cursor-pointer transition-colors flex items-center justify-between gap-2 ${
        isActive
          ? "bg-(--surface-2) border-l-2 border-l-(--primary)"
          : "hover:bg-(--surface-1)"
      }`}
    >
      <div className="flex flex-col min-w-0">
        <h4 className="font-medium text-sm text-(--text-primary) truncate">
          Conversa #{conversation.id.slice(0, 8)}
        </h4>
        <p className="text-xs text-(--text-muted) truncate mt-0.5">
          {conversation.lastMessage || "Nenhuma mensagem ainda"}
        </p>
      </div>

      {conversation.unreadMessages > 0 && (
        <span className="px-1.5 py-0.2 text-[10px] bg-(--primary) text-white rounded-full font-bold">
          {conversation.unreadMessages}
        </span>
      )}
    </div>
  );
}
