import { useState } from "react";
import { ULIB } from "@/shared/ui";
import { Send, DollarSign } from "react-feather";

interface MessageComposerProps {
  onSendMessage: (content: string) => Promise<any>;
  onOpenOffer?: () => void;
  disabled?: boolean;
}

export function MessageComposer({
  onSendMessage,
  onOpenOffer,
  disabled = false,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending || disabled) return;

    setSending(true);
    await onSendMessage(content.trim());
    setContent("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 border-t border-(--border-subtle) bg-(--surface-1) flex items-center gap-2"
    >
      {onOpenOffer && (
        <button
          type="button"
          onClick={onOpenOffer}
          disabled={disabled}
          className="p-2 rounded hover:bg-(--surface-2) text-(--text-muted) hover:text-(--primary) transition-colors cursor-pointer"
          title="Fazer proposta formal"
        >
          <DollarSign size={18} />
        </button>
      )}

      <ULIB.input
        placeholder="Digite sua mensagem..."
        value={content}
        onChange={(e: any) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || sending}
        className="flex-1 text-sm"
      />

      <ULIB.button
        type="submit"
        disabled={!content.trim() || sending || disabled}
        className="px-3 py-2 flex items-center justify-center cursor-pointer"
        aria-label="Enviar mensagem"
      >
        <Send size={16} />
      </ULIB.button>
    </form>
  );
}
