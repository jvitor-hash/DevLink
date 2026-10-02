import { useEffect, useRef, useState, type KeyboardEvent, type SubmitEvent } from "react";
import { X } from "react-feather";

import type { TicketDTO, TicketStatus } from "@/data/types/database";
import Button from "@/components/ui/button_component";
import Input from "@/components/form/input_component";
import TextArea from "@/components/form/textarea_component";
import { SegmentedButton } from "@/components/form/segmented_button_component";
import {
  COLUMNS,
  DEFAULT_PRIORITY,
  PRIORITIES,
  normalizeTag,
  tagChipClass,
  uniqueTags,
  type TicketMeta,
  type TicketPriority,
} from "./ticket_board";

const MAX_TITLE_LENGTH = 200;

export type TicketFormValues = {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  tags: string[];
};

type TicketModalProps = {
  ticket: TicketDTO | null;
  initialStatus: TicketStatus;
  initialMeta: TicketMeta;
  onClose: () => void;
  onSubmit: (values: TicketFormValues) => void;
  onDelete: (ticket: TicketDTO) => void;
};

export default function TicketModal({
  ticket,
  initialStatus,
  initialMeta,
  onClose,
  onSubmit,
  onDelete,
}: TicketModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isEditing = ticket !== null;

  const [title, setTitle] = useState<string>(ticket?.title ?? "");
  const [description, setDescription] = useState<string>(ticket?.description ?? "");
  const [status, setStatus] = useState<TicketStatus>(ticket?.status ?? initialStatus);
  const [priority, setPriority] = useState<TicketPriority>(initialMeta.priority ?? DEFAULT_PRIORITY);
  const [tags, setTags] = useState<string[]>(uniqueTags(initialMeta.tags));
  const [tagDraft, setTagDraft] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Mounted only while open, so the dialog shows once on mount like LoginModal.
  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const addTag = (): void => {
    const tag = normalizeTag(tagDraft);

    setTagDraft("");

    if (!tag) return;

    setTags((current) => (current.some((item) => item.toLowerCase() === tag.toLowerCase()) ? current : [...current, tag]));
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== "Enter" && event.key !== ",") return;

    event.preventDefault();
    addTag();
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      setError("Dê um título ao cartão.");

      return;
    }

    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      setError(`O título deve ter no máximo ${MAX_TITLE_LENGTH} caracteres.`);

      return;
    }

    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      status,
      priority,
      tags,
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClose={onClose}
      aria-label={isEditing ? "Editar cartão" : "Novo cartão"}
      className="animated-dialog m-auto w-[min(32rem,92vw)] rounded-md border border-(--border-subtle) bg-(--surface-1) p-6 text-(--text-primary)"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl">{isEditing ? "Editar cartão" : "Novo cartão"}</h2>
          <p className="mt-1 text-xs text-(--text-muted)">
            {isEditing ? "Atualize o conteúdo e mova o cartão de coluna." : "Descreva o trabalho e escolha a coluna inicial."}
          </p>
        </div>

        <button type="button" onClick={onClose} aria-label="Fechar" className="rounded p-1 hover:bg-(--surface-2)">
          <X size={16} />
        </button>
      </div>

      <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Título"
          name="ticket-title"
          inputType="text"
          dataTestId="ticket-title-input"
          placeholder="O que precisa ser feito?"
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          onChange={(event) => setTitle(event.target.value)}
        />

        <TextArea
          name="ticket-description"
          label="Descrição"
          dataTestId="ticket-description-input"
          placeholder="Contexto, critérios de aceite, links..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div>
          <p className="mb-2 text-sm">Tags</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="frontend e Enter"
              aria-label="Nova tag"
              data-testid="ticket-tag-input"
              className="flex-1 rounded border border-(--border-subtle) bg-(--surface-2) px-3 py-2 text-sm outline-none focus:border-(--primary)"
            />

            <Button label="Adicionar" buttonType="button" colorType="secondary" dataTestId="ticket-tag-add" onClick={addTag} className="px-4 py-2 text-xs" />
          </div>

          {tags.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <li key={tag}>
                  <span className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] ${tagChipClass(tag)}`}>
                    {tag}

                    <button
                      type="button"
                      aria-label={`Remover tag ${tag}`}
                      onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                      className="hover:cursor-pointer hover:text-(--text-primary)"
                    >
                      <X size={10} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm">Prioridade</p>

          <SegmentedButton
            name="ticket-priority"
            items={Object.fromEntries(PRIORITIES.map((item) => [item.value, item.label]))}
            value={priority}
            onChange={(value) => setPriority(value as TicketPriority)}
          />
        </div>

        <div>
          <p className="mb-2 text-sm">Coluna</p>

          <SegmentedButton
            name="ticket-status"
            items={Object.fromEntries(COLUMNS.map((column) => [column.status, column.label]))}
            value={status}
            onChange={(value) => setStatus(value as TicketStatus)}
          />
        </div>

        {error && <p role="alert" className="text-sm text-(--error)">{error}</p>}

        <footer className="flex items-center justify-between gap-2 border-t border-(--border-subtle) pt-4">
          {isEditing ? (
            <Button
              label="Excluir"
              buttonType="button"
              colorType="error"
              dataTestId="ticket-delete-btn"
              onClick={() => onDelete(ticket)}
              className="px-4 py-1.5 text-xs"
            />
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button label="Cancelar" buttonType="button" colorType="secondary" dataTestId="ticket-cancel-btn" onClick={onClose} className="px-4 py-1.5 text-xs" />

            <Button
              label={isEditing ? "Salvar" : "Criar cartão"}
              buttonType="submit"
              colorType="success"
              dataTestId="ticket-submit-btn"
              className="px-4 py-1.5 text-xs"
            />
          </div>
        </footer>
      </form>
    </dialog>
  );
}
