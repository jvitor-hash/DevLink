import { useState } from "react";
import { ULIB } from "@/shared/ui";
import type { TicketCreate, TicketDTO, TicketStatus } from "@/shared/types/database";
import {
  PRIORITIES,
  DEFAULT_PRIORITY,
  type TicketPriority,
  type TicketMeta,
} from "../types/ticket_board";
import { X } from "react-feather";

interface TicketModalProps {
  projectId: string;
  initialStatus?: TicketStatus;
  ticketToEdit?: TicketDTO | null;
  metaToEdit?: TicketMeta | null;
  onClose: () => void;
  onSave: (data: TicketCreate, meta: TicketMeta) => Promise<void>;
}

export function TicketModal({
  projectId,
  initialStatus = "BACKLOG",
  ticketToEdit,
  metaToEdit,
  onClose,
  onSave,
}: TicketModalProps) {
  const [title, setTitle] = useState(ticketToEdit?.title ?? "");
  const [description, setDescription] = useState(ticketToEdit?.description ?? "");
  const [status, setStatus] = useState<TicketStatus>(ticketToEdit?.status ?? initialStatus);
  const [priority, setPriority] = useState<TicketPriority>(metaToEdit?.priority ?? DEFAULT_PRIORITY);
  const [tagsInput, setTagsInput] = useState(metaToEdit?.tags.join(", ") ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#+/, ""))
      .filter(Boolean);

    await onSave(
      {
        projectId,
        title: title.trim(),
        description: description.trim() || null,
        status,
      },
      {
        priority,
        tags: parsedTags,
      }
    );
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-(--surface-1) border border-(--border) p-6 rounded-md flex flex-col gap-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-(--border-subtle)">
          <h3 className="text-lg font-semibold">
            {ticketToEdit ? "Editar Ticket" : "Novo Ticket"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ULIB.field>
            <ULIB.label htmlFor="ticket-title" required>
              Título
            </ULIB.label>
            <ULIB.input
              id="ticket-title"
              value={title}
              onChange={(e: any) => setTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
              required
            />
          </ULIB.field>

          <ULIB.field>
            <ULIB.label htmlFor="ticket-desc">Descrição</ULIB.label>
            <ULIB.textarea
              id="ticket-desc"
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
              placeholder="Detalhes ou critérios de aceitação..."
              rows={3}
            />
          </ULIB.field>

          <div className="grid grid-cols-2 gap-3">
            <ULIB.field>
              <ULIB.label htmlFor="ticket-status">Coluna / Status</ULIB.label>
              <ULIB.select
                id="ticket-status"
                value={status}
                onChange={(e: any) => setStatus(e.target.value as TicketStatus)}
              >
                <ULIB.selectOption value="BACKLOG">Backlog</ULIB.selectOption>
                <ULIB.selectOption value="IN_PROGRESS">Em andamento</ULIB.selectOption>
                <ULIB.selectOption value="REVIEW">Validação</ULIB.selectOption>
                <ULIB.selectOption value="DONE">Finalizado</ULIB.selectOption>
              </ULIB.select>
            </ULIB.field>

            <ULIB.field>
              <ULIB.label htmlFor="ticket-priority">Prioridade</ULIB.label>
              <ULIB.select
                id="ticket-priority"
                value={priority}
                onChange={(e: any) => setPriority(e.target.value as TicketPriority)}
              >
                {PRIORITIES.map((p) => (
                  <ULIB.selectOption key={p.value} value={p.value}>
                    {p.label}
                  </ULIB.selectOption>
                ))}
              </ULIB.select>
            </ULIB.field>
          </div>

          <ULIB.field>
            <ULIB.label htmlFor="ticket-tags">Tags (separadas por vírgula)</ULIB.label>
            <ULIB.input
              id="ticket-tags"
              value={tagsInput}
              onChange={(e: any) => setTagsInput(e.target.value)}
              placeholder="ex: frontend, bug, auth"
            />
          </ULIB.field>

          <div className="flex justify-end gap-2 pt-2">
            <ULIB.button type="button" tone="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </ULIB.button>
            <ULIB.button type="submit" disabled={saving}>
              {saving ? "Salvando..." : ticketToEdit ? "Salvar" : "Criar Ticket"}
            </ULIB.button>
          </div>
        </form>
      </div>
    </div>
  );
}
