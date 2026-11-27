import { useState } from "react";
import { ConversationList } from "./conversation_list";
import { MessageList } from "./message_list";
import { MessageComposer } from "./message_composer";
import { OfferModal } from "./offer_modal";
import { useConversations } from "../hooks/use_conversations";
import { useMessages } from "../hooks/use_messages";
import { messageService } from "../service/message_service";
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
    createConversation,
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
    let convId = activeConversationId;
    if (!convId && projectId) {
      const created = await createConversation({
        projectId,
        userId: currentUser?.id,
      } as any);
      if (created) {
        convId = created.id;
        setActiveConversationId(created.id);
      }
    }

    if (convId) {
      if (activeConversationId) {
        await sendMessage({
          content: text,
          messageType: "MESSAGE",
        });
      } else {
        await messageService.sendMessage({
          conversationId: convId,
          content: text,
          messageType: "MESSAGE",
        });
      }
    }
  };

  const handleSendOffer = async (offerData: { money: number; deadline: string; notes: string }) => {
    let convId = activeConversationId;
    if (!convId && projectId) {
      const created = await createConversation({
        projectId,
        userId: currentUser?.id,
      } as any);
      if (created) {
        convId = created.id;
        setActiveConversationId(created.id);
      }
    }

    if (convId) {
      const payload = {
        conversationId: convId,
        content: offerData.notes || `Proposta enviada no valor de R$ ${offerData.money.toLocaleString("pt-BR")}`,
        messageType: "OFFER" as const,
        offerMoney: offerData.money,
        offerDeadline: offerData.deadline,
        offerStatus: "PENDING" as const,
      };

      if (activeConversationId) {
        await sendMessage(payload);
      } else {
        await messageService.sendMessage(payload);
      }
    }
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
                  : projectId
                  ? "Conversar com o criador do projeto"
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
            onOpenOffer={currentUser?.role === "PROGRAMMER" ? () => setOfferModalOpen(true) : undefined}
            disabled={!activeConversationId && !projectId}
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
