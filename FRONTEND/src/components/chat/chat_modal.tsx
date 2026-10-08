import { useEffect, useRef, useState } from "react";
import { ChevronLeft, DollarSign, Search, Send, Smile, X } from "react-feather";
import { messageService } from "@/data/services/message_service";
import { conversationService } from "@/data/services/conversation_service";
import { formatRelativeTime } from "@/utils/time_formatting";
import { userSingleton } from "@/context/user";

import type { ProjectDTO } from "@/data/types/database";

type ChatModalProps = {
  show: boolean;
  onClose: () => void;
  project?: ProjectDTO;
};

export default function ChatModal({ show, onClose, project }: ChatModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedConversation, setConversation] = useState<string | null>(null);
  const [toggledSearch, setToggledSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [negotiationOpen, setNegotiationOpen] = useState(false);
  const [negotiationAmount, setNegotiationAmount] = useState("");
  const [negotiationDeadline, setNegotiationDeadline] = useState("");
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadedCount, setLoadedCount] = useState(10);
  const [inputText, setInputText] = useState("");

  const currentUserId = userSingleton.id ?? "";
  const role = userSingleton.role ?? "";

  useEffect(() => {
    conversationService.list(project ? { projectId: project.id } : undefined).then((res: any) => {
      let data = Array.isArray(res) ? res : res?.data ?? [];
      if (role === "PROGRAMMER") {
        data = data.filter((c: any) => c.userId === currentUserId);
      }
      setConversations(data);
    }).catch(() => setConversations([]));
  }, [show, role, currentUserId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (show && !dialog.open) dialog.showModal();
    if (!show && dialog.open) dialog.close();
  }, [show]);

  const close = () => {
    dialogRef.current?.close();
    onClose();
  };

  const toggleSearch = () => setToggledSearch(c => !c);

  const handleConvesationSelect = (id: string) => {
    setConversation(id);
    setLoadedCount(10);
  };

  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  useEffect(() => {
    const ids = new Set<string>();
    for (const c of conversations) {
      if (c.userId) ids.add(c.userId);
      if (c.recipientId) ids.add(c.recipientId);
    }
    for (const id of ids) {
      import("@/data/services/user_service").then(({ userService }) => {
        userService.getById(id).then((user: any) => {
          setUserNames(prev => ({ ...prev, [id]: user?.name || id }));
        }).catch(() => {
          setUserNames(prev => ({ ...prev, [id]: id }));
        });
      });
    }
  }, [conversations]);

  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    messageService.list({ conversationId: selectedConversation, limit: 100 }).then((res: any) => {
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setMessages(data);
    }).catch(() => setMessages([]));
  }, [selectedConversation]);

  const filteredMessages = messages.filter(m =>
    (m.content ?? m.message ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleMessages = filteredMessages.slice(0, loadedCount);
  const hasMore = filteredMessages.length > visibleMessages.length;

  const sendMessage = async () => {
    console.log("sendMessage triggered", inputText, selectedConversation, role);
    const text = inputText.trim();
    if (!text) {
      console.warn("sendMessage skipped: no text");
      return;
    }
    try {
      let conversationId = selectedConversation;
      if (!conversationId && project) {
        const newConv = await conversationService.create({
          projectId: project.id,
          userId: currentUserId,
          recipientId: project.clientId,
          lastMessage: text,
        });
        conversationId = newConv.id ?? newConv;
        setConversation(conversationId);
      }
      if (!conversationId) {
        console.warn("sendMessage skipped: no conversation selected and no project context");
        return;
      }
      await messageService.create({ conversationId, content: text, recipientId: project?.clientId, projectId: project?.id });
      messageService.list({ conversationId, limit: 100 }).then((res: any) => {
        const data = Array.isArray(res) ? res : res?.data ?? [];
        setMessages(data);
      });
      setInputText("");
      // Refresh conversation list so new conversation appears
      conversationService.list().then((res: any) => {
        let data = Array.isArray(res) ? res : res?.data ?? [];
        if (role === "PROGRAMMER") {
          data = data.filter((c: any) => c.userId === currentUserId || c.recipientId === currentUserId);
        }
        setConversations(data);
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const sendNegotiation = async () => {
    if (!selectedConversation) return;
    const text = `Proposal: $${negotiationAmount} by ${negotiationDeadline || "TBD"}. ${negotiationMessage}`;
    await messageService.create({ conversationId: selectedConversation, content: text });
    messageService.list({ conversationId: selectedConversation, limit: 100 }).then((res: any) => {
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setMessages(data);
    });
    setNegotiationOpen(false);
    setNegotiationAmount("");
    setNegotiationDeadline("");
    setNegotiationMessage("");
  };

  return (
    <>
      <div onClick={close} className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity ${show ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <dialog ref={dialogRef} onCancel={close} className="animated-dialog grid place-items-center w-6xl h-[80vh] bg-(--background) border border-(--primary) m-auto">
        <div className="flex w-full h-full overflow-hidden">
          {/* Chat conversations */}
          <div className="flex-2 border-r border-(--border-subtle)">
            <header className="flex p-3 justify-between items-center border-b border-(--border-subtle)">
              <p className="text-(--text-primary) text-base">Chat Conversations</p>
              <button className="border-none cursor-pointer hover:bg-(--surface-3)/95 p-1 transition-colors" onClick={close}>
                <X size={16} color="var(--text-primary)" />
              </button>
            </header>
            <div className="flex flex-col gap-2 overflow-y-auto">
              {/* Empty state */}
              {conversations.length === 0 && (
                <div className="p-4 text-sm text-(--text-muted) text-center">No conversations yet.</div>
              )}
              {conversations.map((conversation) => (
                <div key={conversation.id} className="p-2 hover:bg-(--surface-3)/95 cursor-pointer transition-colors" onClick={() => handleConvesationSelect(conversation.id)}>
                  <h5 className="text-sm text-(--text-primary)">{userNames[conversation.userId ?? conversation.recipientId] ?? (conversation.userId ?? conversation.recipientId)}</h5>
                  <p className="text-sm text-(--text-muted)">{conversation.lastMessage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-8">
            <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto]">
              <header className="flex flex-col border-b border-(--border-subtle) p-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <button className="cursor-pointer border-none p-1 transition-colors hover:bg-(--surface-3)/95" onClick={() => setConversation(null)}>
                      <ChevronLeft size={16} color="var(--text-primary)" />
                    </button>
                    <p className="text-base text-(--text-primary)">
                      {selectedConv ? (userNames[selectedConv.userId ?? selectedConv.recipientId] ?? (selectedConv.userId ?? selectedConv.recipientId ?? selectedConv.id)) : "Select a conversation"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className={`cursor-pointer border-none p-1 transition-colors ${toggledSearch ? 'bg-(--surface-3)/95' : 'hover:bg-(--surface-3)/95'}`} onClick={toggleSearch}>
                      <Search size={16} color="var(--text-primary)" />
                    </button>
                  </div>
                </div>
                {toggledSearch && (
                  <input
                    type="text"
                    placeholder="Search chat messages...."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="mt-2 w-full max-w-sm rounded-sm border border-(--border-subtle) p-2 text-(--text-secondary) outline-none"
                  />
                )}
              </header>

              <div className="min-h-0 overflow-y-auto p-2">
                <div className="flex flex-col gap-2">
                  {/* Empty state */}
                  {!selectedConv && (
                    <div className="text-sm text-(--text-muted) text-center">Select a conversation to view messages.</div>
                  )}
                  {selectedConv && messages.length === 0 && (
                    <div className="text-sm text-(--text-muted) text-center">No messages yet.</div>
                  )}
                  {visibleMessages.map((message: any) => {
                    const msgText = message.message ?? message.content ?? "";
                    const msgTime = message.sentAt ?? message.createdAt ?? message.updatedAt;
                    const msgSender = message.userId ?? currentUserId;
                    const isCurrentUser = msgSender === currentUserId;
                    return (
                      <div key={message.id} className={`w-full max-w-75 rounded-sm p-1 px-2 shadow-sm ${isCurrentUser ? 'bg-(--primary) self-end' : 'bg-(--surface-2)'}`}>
                        <p className={`text-sm ${isCurrentUser ? 'text-white' : 'text-(--text-primary)'}`}>{msgText}</p>
                        <p className={`text-end text-xs ${isCurrentUser ? 'text-white/80' : 'text-(--text-muted)'}`}>{formatRelativeTime(msgTime)}</p>
                      </div>
                    );
                  })}
                  {/* Lazy load button */}
                  {selectedConv && hasMore && (
                    <button onClick={() => setLoadedCount(c => c + 10)} className="self-center text-xs text-(--text-muted) hover:text-(--text-primary)">
                      Load more messages
                    </button>
                  )}
                </div>
              </div>

              <footer className="flex items-center gap-2 border-t border-(--border-subtle) p-3">
                {/* Negotiation proposal inline */}
                {negotiationOpen && (
                  <div className="absolute bottom-16 right-4 bg-(--surface-2) border border-(--border-subtle) rounded-sm p-3 shadow-lg z-50">
                    <p className="text-sm font-semibold mb-2">Negotiation Proposal</p>
                    <input type="text" placeholder="Amount" value={negotiationAmount} onChange={e => setNegotiationAmount(e.target.value)} className="w-full mb-1 rounded-sm border border-(--border-subtle) p-1 text-sm" />
                    <input type="text" placeholder="Deadline" value={negotiationDeadline} onChange={e => setNegotiationDeadline(e.target.value)} className="w-full mb-1 rounded-sm border border-(--border-subtle) p-1 text-sm" />
                    <textarea placeholder="Optional message" value={negotiationMessage} onChange={e => setNegotiationMessage(e.target.value)} className="w-full mb-2 rounded-sm border border-(--border-subtle) p-1 text-sm" />
                    <button onClick={sendNegotiation} className="w-full rounded-sm bg-(--primary) p-1 text-xs text-white">Send Proposal</button>
                  </div>
                )}
                {/* Emoji picker */}
                {emojiPickerOpen && (
                  <div className="absolute bottom-16 left-4 bg-(--surface-2) border border-(--border-subtle) rounded-sm p-2 shadow-lg z-50 flex gap-1">
                    {["😀", "😂", "😍", "👍", "🔥", "🎉"].map(emoji => (
                      <button key={emoji} onClick={() => {
                        setInputText(prev => prev + emoji);
                        setEmojiPickerOpen(false);
                      }} className="text-lg hover:bg-(--surface-3)">{emoji}</button>
                    ))}
                  </div>
                )}
                <input
                  className="w-full rounded-sm border border-(--border-subtle) p-2 text-(--text-secondary) outline-none"
                  placeholder="Digite sua mensagem..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                />
                <button className="cursor-pointer p-2 transition-colors hover:bg-(--surface-3)/95" onClick={() => setEmojiPickerOpen(c => !c)}>
                  <Smile size={16} color="var(--text-primary)" />
                </button>
                <button className="cursor-pointer rounded-sm bg-(--primary) p-2" onClick={() => setNegotiationOpen(c => !c)}>
                  <DollarSign size={16} color="white" />
                </button>
                <button className="cursor-pointer rounded-sm bg-(--primary) p-2" onClick={sendMessage}>
                  <Send size={16} color="white" />
                </button>
              </footer>
            </div>
          </div>
        </div>
      </dialog>
    </>
  )
}
