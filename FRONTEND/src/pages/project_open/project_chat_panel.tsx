import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "react-feather";
import { useParams } from "react-router-dom";
import Input from "@/components/ui/input_component";
import Button from "@/components/ui/button_component";

const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

type ProjectChatPanelProps = {
  open: boolean;
  onToggle: () => void;
};

export default function ProjectChatPanel({ open, onToggle }: ProjectChatPanelProps) {
  const { projectId } = useParams<{ projectId: string }>();
  return (
    <>
      {open ? (
        <div
          data-testid="chat-dock"
          className="flex w-80 flex-col rounded-md border border-(--border-subtle) bg-(--surface-1) xl:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-(--border-subtle) p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-(--text-primary)">
              <MessageCircle size={18} aria-hidden="true" />
              Chat do projeto
            </h2>

            <button
              type="button"
              onClick={onToggle}
              aria-label="Fechar chat"
              data-testid="close-chat-btn"
              className="rounded-sm p-1 text-(--text-primary) border border-(--border-subtle)
              hover:cursor-pointer transition-colors hover:bg-(--surface-2)"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
          </div>

          {/* Composer */}
          <form className="flex">
            <button
              type="button"
              aria-label="Enviar proposta de prazo"
              title="Enviar proposta de prazo"
              data-testid="offer-mode-btn"
              className="w-8 h-8 rounded-full border border-(--border-subtle) transition-colors hover:cursor-pointer"
            >
              $
            </button>

            <Input
              label=""
              placeholder="Digite a sua message aqui..."
              name="chatMessage"
              dataTestId="chat-input"

            />

            <button
              type="submit"
              aria-label="Enviar mensagem"
              data-testid="chat-send-btn"
              className="w-8 h-8 grid place-items-center rounded-full bg-(--primary) hover:cursor-pointer"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </form>
        </div>
      ) : ""}
    </>
  );
}
