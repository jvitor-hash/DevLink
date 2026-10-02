import { useState, useEffect, useCallback } from "react";
import {
  X,
  Search,
  Paperclip,
  Smile,
  Send,
  Check,
  ArrowLeft,
} from "react-feather";

import type { ChatRole, ChatMessage, ChatConversation, ChatUser } from "@/data/chat/mock_chat_data";
import { MOCK_MESSAGES, MOCK_CLIENTS } from "@/data/chat/mock_chat_data";


export default function ChatModal({
  open,
  onClose,
  currentUser,
}: {
  open: boolean;
  onClose: () => void;
  currentUser: ChatUser;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [conversations, setConversations] = useState<ChatConversation[]>([
    {
      id: "conv-1",
      title: "Projeto Alpha",
      participants: [currentUser, { id: "client-1", name: "Carlos (Cliente)", role: "client" as ChatRole, avatar: "https://i.pravatar.cc/150?u=carlos" }],
      lastMessage: MOCK_MESSAGES["conv-1"]?.[MOCK_MESSAGES["conv-1"].length - 1] ?? { id: "init", conversationId: "conv-1", senderId: "client-1", text: "Início de conversa.", timestamp: new Date().toISOString(), read: false, delivered: true },
      unreadCount: 2,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "conv-2",
      title: "Projeto Beta",
      participants: [currentUser, { id: "prog-2", name: "Bruno (Dev)", role: "programmer" as ChatRole, avatar: "https://i.pravatar.cc/150?u=bruno" }],
      lastMessage: MOCK_MESSAGES["conv-2"]?.[MOCK_MESSAGES["conv-2"].length - 1] ?? { id: "init", conversationId: "conv-2", senderId: "prog-2", text: "Início de conversa.", timestamp: new Date().toISOString(), read: false, delivered: true },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const selectedConv = conversations.find((c) => c.id === selectedId);
  const messages = selectedConv ? MOCK_MESSAGES[selectedConv.id] ?? [] : [];

  const canSendTo = useCallback(
    (conv: ChatConversation) => {
      const other = conv.participants.find((p) => p.id !== currentUser.id);
      if (!other) return false;
      if (currentUser.role === "programmer") return true;
      if (other.role === "client") return false;
      const hasProgrammerFirst = messages.find((m) => m.senderId !== currentUser.id);
      return !!hasProgrammerFirst;
    },
    [currentUser, messages],
  );

  const handleSend = () => {
    if (!selectedConv) return;
    const text = (draft[selectedConv.id] || "").trim();
    if (!text) return;
    const allowed = canSendTo(selectedConv);
    if (!allowed) {
      alert("Você não pode enviar mensagens nesta conversa.");
      return;
    }
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: selectedConv.id,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
      read: false,
      delivered: true,
    };
    setDraft((prev) => ({ ...prev, [selectedConv.id]: "" }));
    // Mock update
    const updatedConvs = conversations.map((c) =>
      c.id === selectedConv.id ? { ...c, lastMessage: newMsg, unreadCount: 0 } : c,
    );
    setConversations(updatedConvs);
  };

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          unreadCount: c.id === "conv-2" ? Math.max(0, c.unreadCount - 1) : c.unreadCount,
        })),
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Chat"
      onClick={onClose}
    >
      <div
        className="relative w-[98vw] max-w-5xl h-[85vh] rounded-none bg-[#161212] border-2 border-[#D6212B] p-4 shadow-[8px_8px_0px_#D6212B] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="gb-heading text-lg tracking-tight text-white">Mensagens</h2>
          <button onClick={onClose} aria-label="Fechar chat" className="hover:text-(--gb-ink)">
            <X size={18} color="#F0F0F0" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden gap-3 min-h-0">
          {/* Conversation list */}
          <aside className={`${selectedId ? "hidden md:block" : "w-full md:w-[45%]"} overflow-y-auto border-r border-[#383838] pr-2`}>
            <div className="mb-2 relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#999]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar conversa..."
                className="w-full rounded border border-[#383838] bg-[#1E1E1E] pl-7 pr-2 py-1.5 text-sm text-[#F0F0F0] outline-none focus:border-[#D6212B]"
                aria-label="Buscar conversa"
              />
            </div>
            {currentUser.role === "programmer" && (
              <button
                className="w-full mb-2 rounded border border-[#383838] bg-[#D6212B] py-2 text-xs font-bold text-white hover:bg-[#b51821] transition-colors"
                onClick={() => {
                  const client = MOCK_CLIENTS[0];
                  setConversations((prev) => {
                    const exists = prev.find((c) => c.participants.some((p) => p.id === client.id));
                    if (exists) return prev;
                    const newId = `conv-${Date.now()}`;
                    return [
                      ...prev,
                      {
                        id: newId,
                        title: client.name,
                        participants: [currentUser, client],
                        lastMessage: { id: "init", conversationId: newId, senderId: client.id, text: "Início de conversa.", timestamp: new Date().toISOString(), read: false, delivered: true },
                        unreadCount: 0,
                        createdAt: new Date().toISOString(),
                      },
                    ];
                  });
                }}
              >
                + Nova conversa
              </button>
            )}
            <ul className="flex flex-col gap-1" aria-label="Conversas">
              {conversations.map((conv) => {
                const other = conv.participants.find((p) => p.id !== currentUser.id);
                if (!other) return null;
                const allowed = canSendTo(conv);
                return (
                  <li key={conv.id}>
                    <button
                      onClick={() => {
                        setSelectedId(conv.id);
                      }}
                      disabled={!allowed && currentUser.role === "client"}
                      className={`w-full text-left rounded border p-2 transition-colors ${
                        selectedId === conv.id ? "bg-[#D6212B] border-[#D6212B]" : "border-[#383838] bg-[#1E1E1E] hover:bg-[#272727]"
                      } ${currentUser.role === "client" && !allowed ? "opacity-50 cursor-not-allowed" : ""}`}
                      aria-label={`Conversa com ${other.name}`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={other.avatar || "https://i.pravatar.cc/150?u=default"} alt={other.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-xs font-bold text-[#F0F0F0] truncate">{other.name}</span>
                        {conv.unreadCount > 0 && (
                          <span className="ml-auto rounded-full bg-[#D6212B] px-1.5 py-0.5 text-[10px] font-bold text-white">{conv.unreadCount}</span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-[#999] truncate">{conv.lastMessage.text}</p>
                      {!allowed && currentUser.role === "client" && (
                        <p className="text-[10px] text-[#D6212B] mt-1">Aguardando mensagem de programador</p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Message thread */}
          <main className={`${selectedId ? "w-full md:w-[55%]" : "hidden md:block md:w-[55%]"} flex flex-col min-h-0`}>
            {selectedConv ? (
              <>
                <header className="flex items-center gap-2 mb-2">
                  <button onClick={() => setSelectedId(null)} className="md:hidden text-xs hover:text-(--gb-ink)">
                    <ArrowLeft size={16} />
                  </button>
                  <img src={selectedConv.participants.find((p) => p.id !== currentUser.id)?.avatar || "https://i.pravatar.cc/150?u=default"} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-bold text-[#F0F0F0]">{selectedConv.participants.find((p) => p.id !== currentUser.id)?.name}</p>
                    <p className="text-[10px] text-[#999]">Online</p>
                  </div>
                </header>
                <div className="flex-1 overflow-y-auto space-y-2 py-2">
                  {messages.map((msg) => {
                    const isOwn = msg.senderId === currentUser.id;
                    const senderName = selectedConv.participants.find((p) => p.id === msg.senderId)?.name || "Usuário";
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded p-2 text-sm ${isOwn ? "bg-[#D6212B] text-white rounded-tr-sm" : "bg-[#272727] text-[#F0F0F0] rounded-tl-sm"}`}>
                          <p className="font-bold text-[10px] mb-0.5 opacity-80">{senderName}</p>
                          <p>{msg.text}</p>
                          <p className="text-[9px] mt-1 opacity-60 text-right">
                            {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            {msg.read ? <Check size={10} className="inline ml-1 text-[#D6212B]" /> : <Check size={10} className="inline ml-1" />}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2">
                  {!canSendTo(selectedConv) && currentUser.role === "client" ? (
                    <div className="rounded bg-[#2A1A1A] border border-[#D6212B] p-3 text-xs text-[#F0F0F0]">
                      Você só pode enviar mensagens quando um programador iniciar a conversa.
                    </div>
                  ) : (
                    <form
                      className="flex items-end gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                    >
                      <button type="button" aria-label="Emoji" className="text-[#999] hover:text-[#F0F0F0]">
                        <Smile size={20} />
                      </button>
                      <button type="button" aria-label="Anexo" className="text-[#999] hover:text-[#F0F0F0]">
                        <Paperclip size={20} />
                      </button>
                      <input
                        type="text"
                        value={draft[selectedConv?.id || ""] || ""}
                        onChange={(e) => setDraft((prev) => ({ ...prev, [selectedConv?.id || ""]: e.target.value }))}
                        placeholder="Digite uma mensagem..."
                        className="flex-1 rounded border border-[#383838] bg-[#1E1E1E] px-3 py-2 text-sm text-[#F0F0F0] outline-none focus:border-[#D6212B]"
                        disabled={!canSendTo(selectedConv) && currentUser.role === "client"}
                      />
                      <button
                        type="submit"
                        className="rounded bg-[#D6212B] px-3 py-2 text-xs font-bold text-white hover:bg-[#b51821] transition-colors disabled:opacity-50"
                        disabled={(!draft[selectedConv?.id || ""]?.trim()) || (!canSendTo(selectedConv) && currentUser.role === "client")}
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#999] text-sm">
                Selecione uma conversa para ver as mensagens.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
