import { useEffect, useRef } from "react";
import { MessageBubble } from "./message_bubble";
import type { MessageDTO, OfferStatus } from "@/shared/types/database";

interface MessageListProps {
  messages: MessageDTO[];
  currentUserId?: string;
  loading?: boolean;
  onRespondOffer?: (messageId: string, status: OfferStatus) => void;
}

export function MessageList({
  messages,
  currentUserId,
  loading = false,
  onRespondOffer,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xs text-(--text-muted)">
        Carregando mensagens...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xs text-(--text-muted) italic">
        Nenhuma mensagem trocada ainda. Inicie a conversa abaixo!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          currentUserId={currentUserId}
          onRespondOffer={onRespondOffer}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
