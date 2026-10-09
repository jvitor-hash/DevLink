import { useEffect, useRef } from "react";
import ConversationHistory from "./conversation_history";
import MessageHistory from "./message_history";
import { ChatProvider, useChat } from "./chat_context";

type ChatModalProps = {
  show: boolean;
  onClose: () => void;
  project?: { id: string; clientId: string };
};

function ChatContent({ projectId, clientId }: { projectId?: string; clientId?: string }) {
  const { conversationId } = useChat();
  return (
    <div className="flex w-full h-full overflow-hidden">
      <ConversationHistory key={projectId} projectId={projectId} />
      <MessageHistory
        key={conversationId ?? "empty"}
        conversationId={conversationId}
        projectId={projectId}
        clientId={clientId}
      />
    </div>
  );
}

export default function ChatModal({ show, onClose, project }: ChatModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const projectId = project?.id;
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (show && !dialog.open) dialog.showModal();
    if (!show && dialog.open) dialog.close();
  }, [show]);
  const close = (): void => {
    dialogRef.current?.close();
    onClose();
  };
  return (
    <ChatProvider close={close}>
      <div
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity ${show ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <dialog
        ref={dialogRef}
        onCancel={close}
        className="animated-dialog grid place-items-center w-6xl h-[80vh] bg-(--background) border border-(--primary) m-auto"
      >
        <ChatContent projectId={projectId} clientId={project?.clientId} />
      </dialog>
    </ChatProvider>
  );
}
