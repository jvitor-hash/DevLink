import { useEffect, useRef, useState } from "react";
import { ChevronLeft, DollarSign, Paperclip, Search, Send, Smile, X } from "react-feather";
import { mockChatConversations } from "@/data/mock_chat_data";

type ChatModalProps = {
  show: boolean;
  onClose: () => void
};

export default function ChatModal({ show, onClose }: ChatModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedConversation, setConversation] = useState<string | null>(null);
  const [toggledSearch, setToggledSearch] = useState<boolean>(false);

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

  const toggleSearch = () => {
    setToggledSearch(c => !c)
  }

  const handleConvesationSelect = (id: string) => {
    setConversation(id);
  }

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
            <div className="flex flex-col gap-2 overflow-y-auto h-full">
              {mockChatConversations.map((conversation) => (
                <div key={conversation.id} className="p-2 hover:bg-(--surface-3)/95 cursor-pointer transition-colors" onClick={() => handleConvesationSelect(conversation.id)}>
                  <h5 className="text-sm text-(--text-primary)">{conversation.userId}</h5>
                  <p className="text-sm text-(--text-muted)">{conversation.lastMessage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-8">
            <div className="grid grid-rows-[auto_1fr_auto]">
              <header className="flex flex-col border-b border-(--border-subtle) p-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <button className="border-none cursor-pointer hover:bg-(--surface-3)/95 p-1 transition-colors">
                      <ChevronLeft size={16} color="var(--text-primary)" />
                    </button>
                    <p className="text-(--text-primary) text-base">{selectedConversation}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className={`border-none cursor-pointer ${toggledSearch ? 'bg-(--surface-3)/95' : 'hover:bg-(--surface-3)/95'} p-1 transition-colors`} onClick={toggleSearch}>
                      <Search size={16} color="var(--text-primary)" />
                    </button>
                  </div>
                </div>
                <div>
                  {toggledSearch && (
                    <>
                      <input
                        type="text"
                        placeholder="Search chat messages...."
                        className="justify-end outline-none border border-(--border-subtle) p-2 rounded-sm text-(--text-secondary) mt-2 w-full max-w-sm"
                      />
                    </>
                  )}
                </div>
              </header>

              <div className="flex flex-col p-2 gap-2 overflow-y-auto min-h-0">
                {mockChatConversations.map((conv) => (
                  <>
                    {conv.messages.map((message) => (
                      <div className="bg-(--surface-2) p-1 px-2 shadow-sm rounded-sm w-full max-w-75">
                        <p className="text-(--text-primary)">{message.message}</p>
                        <p className="text-end text-xs text-(--text-muted)">{message.sentAt.toDateString()}</p>
                      </div>
                    ))}
                  </>
                ))}
              </div>

              <footer className="flex items-center gap-2 border-t border-(--border-subtle) p-3">
                <input className="outline-none border border-(--border-subtle) p-2 rounded-sm text-(--text-secondary) w-full" placeholder="Digite sua mensagem..." />
                <button className="cursor-pointer hover:bg-(--surface-3)/95 p-2 transition-colors">
                  <Smile size={16} color="var(--text-primary)" />
                </button>
                <button className="cursor-pointer hover:bg-(--surface-3)/95 p-2 transition-colors">
                  <Paperclip size={16} color="var(--text-primary)" />
                </button>
                <button className="cursor-pointer bg-(--primary) rounded-sm p-2">
                  <DollarSign size={16} color="white"/>
                </button>
                <button className="cursor-pointer bg-(--primary) rounded-sm p-2">
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
