import { useEffect, useRef } from "react";

type ChatModalProps = {
  show: boolean;
  onClose: () => void
};

export default function ChatModal({ show, onClose }: ChatModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // const selectedConversation = useRef<string | null>(null);

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

  return (
    <>
      <div onClick={close} className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity ${show ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <dialog ref={dialogRef} onCancel={close} className="animated-dialog grid place-items-center w-6xl h-[80vh] bg-(--surface-1) border border-w-2 border-(--primary) m-auto">
        <div className="flex w-full h-full">
          {/* Chat conversations */}
          <div className="flex-1 border-r border-(--border-subtle)">
            <header className="flex p-4">
              <p className="text-(--text-primary) text-base">Chat Conversations</p>
            </header>
            <div className="flex flex-col gap-2 overflow-y-auto h-full">
              {}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-8">

          </div>
        </div>
      </dialog>
    </>
  )
}
