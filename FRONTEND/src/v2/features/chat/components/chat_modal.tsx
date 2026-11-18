import { useState } from "react";
import { ConversationList } from "./conversation_list";
import { MessageList } from "./message_list";
import { MessageComposer } from "./message_composer";
import { OfferModal } from "./offer_modal";
import { useConversations } from "../hooks/use_conversations";
import { useMessages } from "../hooks/use_messages";
import { useCurrentUser } from "@/features/auth/hooks/use_current_user";
import { X, MessageCircle } from "react-feather";

interface ChatModalProps {
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ projectId, isOpen, onClose }: ChatModalProps) {
  const currentUser = useCurrentUser();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    loading: loadingConversations,
  } = useConversations(projectId);

  const {
    messages,
    loading: loadingMessages,
    sendMessage,
    respondToOffer,
  } = useMessages(activeConversationId);

  const [offerModalOpen, setOfferModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleSendText = async (text: string) => {
    await sendMessage({
      content: text,
      messageType: "MESSAGE",
    });
  };

  const handleSendOffer = async (offerData: { money: number; deadline: string; notes: string }) => {
    await sendMessage({
      content: offerData.notes || `Proposta enviada no valor de R$ ${offerData.money.toLocaleString()}`,
      messageType: "OFFER",
      offerMoney: offerData.money,
      offerDeadline: offerData.deadline,
      offerStatus: "PENDING",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl h-[600px] bg-(--surface-1) border border-(--border) rounded-lg flex overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar: Conversations */}
        <div className="w-72 border-r border-(--border-subtle) flex flex-col bg-(--surface-2)/20">
          <div className="p-3 border-b border-(--border-subtle) flex items-center gap-2">
            <MessageCircle size={18} className="text-(--primary)" />
            <h3 className="font-semibold text-sm">Mensagens & Propostas</h3>
          </div>

          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
            loading={loadingConversations}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-3 border-b border-(--border-subtle) flex items-center justify-between bg-(--surface-1)">
            <div>
              <h4 className="font-medium text-sm">
                {activeConversationId
                  ? `Conversa #${activeConversationId.slice(0, 8)}`
                  : "Selecione uma conversa"}
              </h4>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <MessageList
            messages={messages}
            currentUserId={currentUser?.id}
            loading={loadingMessages}
            onRespondOffer={respondToOffer}
          />

          <MessageComposer
            onSendMessage={handleSendText}
            onOpenOffer={() => setOfferModalOpen(true)}
            disabled={!activeConversationId}
          />
        </div>
      </div>

      {offerModalOpen && (
        <OfferModal
          onClose={() => setOfferModalOpen(false)}
          onSubmit={handleSendOffer}
        />
      )}
    </div>
  );
}
