import { OfferCard } from "./offer_card";
import type { MessageDTO, OfferStatus } from "@/shared/types/database";

interface MessageBubbleProps {
  message: MessageDTO;
  currentUserId?: string;
  onRespondOffer?: (messageId: string, status: OfferStatus) => void;
}

export function MessageBubble({
  message,
  currentUserId,
  onRespondOffer,
}: MessageBubbleProps) {
  const isMine = message.senderId === currentUserId;
  const isOffer = message.messageType === "OFFER";

  return (
    <div className={`flex flex-col mb-3 ${isMine ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[75%] p-3 rounded-lg text-sm ${
          isMine
            ? "bg-(--primary) text-white rounded-br-none"
            : "bg-(--surface-2) text-(--text-primary) border border-(--border-subtle) rounded-bl-none"
        }`}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>

        {isOffer && (
          <OfferCard
            message={message}
            isMine={isMine}
            onRespond={onRespondOffer}
          />
        )}
      </div>

      {message.createdAt && (
        <span className="text-[10px] text-(--text-muted) mt-1 px-1">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}
