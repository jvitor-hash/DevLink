import { useEffect, useState } from "react";
import { Box, CheckCircle, Trash2 } from "react-feather";

import { todoService } from "@/data/services/todo_service";
import { ticketService } from "@/data/services/ticket_service";

import { reportError } from "@/utils/report_error";
import { toastStore } from "@/utils/toast_store";
import { useTicketMetadata } from "@/hooks/use_ticket_metadata";
import KanbanBoard from "./kanban_board";
import TicketModal, { type TicketFormValues } from "./ticket_modal";
import {
  DEFAULT_TICKET_META,
  applyMove,
  countByStatus,
  indexForDrop,
  orderTickets,
} from "./ticket_board";
import type { TicketDTO, TicketStatus, TodoDTO } from "@/data/types/database";

type ComposerState = { ticket: TicketDTO | null; status: TicketStatus } | null;

type Props = { projectId: string };

export default function ProjectWorkPanel({ projectId }: Props) {
  const [todos, setTodos] = useState<TodoDTO[]>([]);
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState<string>("");
  const [composer, setComposer] = useState<ComposerState>(null);

  const { metaMap, getMeta, setMeta } = useTicketMetadata(projectId);

  useEffect(() => {
    let cancelled = false;

    todoService.listByProject(projectId).then((rows) => {
      if (!cancelled) setTodos(rows);
    }).catch((error: unknown) => reportError("work_panel: carregar todos", error));

    ticketService.listByProject(projectId).then((rows) => {
      if (!cancelled) setTickets(rows);
    }).catch((error: unknown) => reportError("work_panel: carregar tickets", error));

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const counts = countByStatus(tickets);

  const addTodoChecklist = async (): Promise<void> => {
    const title = newTodoTitle.trim();

    if (!title) return;

    try {
      const created = await todoService.create({ projectId, title });
      setTodos((current) => [...current, created]);
    } catch (error) {
      reportError("work_panel: criar item", error);
      return;
    }

    setNewTodoTitle("");
  };

  const toggleTodo = async (todo: TodoDTO): Promise<void> => {
    const nextDone = !todo.isDone;

    setTodos((current) => current.map((row) => (row.id === todo.id ? { ...row, isDone: nextDone } : row)));

    try {
      await todoService.update(todo.id, { isDone: nextDone });
    } catch (error) {
      reportError("work_panel: atualizar item", error);
      setTodos((current) => current.map((row) => (row.id === todo.id ? todo : row)));
    }
  };

  const removeTodo = async (todo: TodoDTO): Promise<void> => {
    const snapshot = todos;

    setTodos((current) => current.filter((row) => row.id !== todo.id));

    try {
      await todoService.remove(todo.id);
    } catch (error) {
      reportError("work_panel: excluir item", error);
      setTodos(snapshot);
    }
  };

  // Optimistic move: the board updates first, then the API confirms the slot.
  const moveTicket = async (ticketId: string, status: TicketStatus, beforeId: string | null): Promise<void> => {
    const snapshot = tickets;
    const column = orderTickets(tickets.filter((ticket) => ticket.status === status && ticket.id !== ticketId));
    const position = indexForDrop(column, beforeId);

    setTickets(applyMove(tickets, ticketId, status, position));

    try {
      await ticketService.update(ticketId, { status, position });
    } catch (error) {
      reportError("board: mover cartão", error);
      setTickets(snapshot);
    }
  };

  const createTicket = async (values: TicketFormValues): Promise<void> => {
    setComposer(null);

    try {
      const created = await ticketService.create({
        projectId,
        title: values.title,
        description: values.description || null,
        status: values.status,
      });

      setTickets((current) => [...current, created]);
      setMeta(created.id, { tags: values.tags, priority: values.priority });
      toastStore.success("Cartão criado.");
    } catch (error) {
      reportError("board: criar cartão", error);
    }
  };

  const editTicket = async (values: TicketFormValues): Promise<void> => {
    const target = composer?.ticket;

    setComposer(null);

    if (!target) return;

    const snapshot = tickets;

    setMeta(target.id, { tags: values.tags, priority: values.priority });

    setTickets((current) => current.map((ticket) => (
      ticket.id === target.id
        ? { ...ticket, title: values.title, description: values.description || null, status: values.status }
        : ticket
    )));

    try {
      const updated = await ticketService.update(target.id, {
        title: values.title,
        description: values.description || null,
        status: values.status,
      });

      setTickets((current) => current.map((ticket) => (ticket.id === target.id ? updated : ticket)));
    } catch (error) {
      reportError("board: salvar cartão", error);
      setTickets(snapshot);
    }
  };

  const deleteTicket = async (): Promise<void> => {
    const target = composer?.ticket;

    setComposer(null);

    if (!target) return;

    const snapshot = tickets;

    setTickets((current) => current.filter((ticket) => ticket.id !== target.id));

    try {
      await ticketService.remove(target.id);
      toastStore.success("Cartão excluído.");
    } catch (error) {
      reportError("board: excluir cartão", error);
      setTickets(snapshot);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-(--surface-1) border border-(--border-subtle) p-4 lg:flex-row">
      <section className="flex shrink-0 flex-col border-(--border) pr-0 lg:w-64 lg:border-r lg:pr-4" aria-label="Checklist">
        <header className="mb-3 flex items-center gap-2">
          <CheckCircle size={16} /> Checklist
          <span className="ml-auto text-xs text-(--text-muted)">
            {todos.filter((todo) => todo.isDone).length}/{todos.length}
          </span>
        </header>

        <input
          type="text"
          value={newTodoTitle}
          onChange={(event) => setNewTodoTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void addTodoChecklist();
          }}
          placeholder="Novo item e Enter..."
          aria-label="Novo item da checklist"
          className="mb-3 w-full rounded border border-(--border-subtle) bg-(--surface-2) px-3 py-2 text-sm outline-none focus:border-(--primary)"
          data-testid="new-todo-input"
        />

        <ul className="flex flex-col gap-1">
          {todos.map((todo) => (
            <li key={todo.id} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => void toggleTodo(todo)}
                className={`flex flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors cursor-pointer hover:bg-(--surface-2) ${todo.isDone ? "text-(--text-muted) line-through" : "text-(--text-primary)"}`}
              >
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded-sm border ${todo.isDone ? "border-(--success) bg-(--success)" : "border-(--border-subtle)"}`}
                />
                {todo.title}
              </button>

              <button
                type="button"
                aria-label={`Excluir item ${todo.title}`}
                onClick={() => void removeTodo(todo)}
                className="rounded p-1 text-(--text-muted) opacity-0 transition-opacity cursor-pointer hover:text-(--error) focus:opacity-100 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}

          {todos.length === 0 && <li className="text-sm text-(--text-muted)">Nenhum item na checklist.</li>}
        </ul>
      </section>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <header className="flex items-center gap-2">
          <Box size={18} /> Board
          <span className="ml-auto text-xs text-(--text-muted)" data-testid="board-total">
            {tickets.length} cartões · {counts.IN_PROGRESS} em andamento
          </span>
        </header>

        <KanbanBoard
          tickets={tickets}
          metaMap={metaMap}
          getMeta={getMeta}
          onOpenTicket={(ticket) => setComposer({ ticket, status: ticket.status })}
          onCreateTicket={(status) => setComposer({ ticket: null, status })}
          onMove={(ticketId, status, beforeId) => void moveTicket(ticketId, status, beforeId)}
        />
      </div>

      {composer && (
        <TicketModal
          // Remounting per session keeps the form state local to the dialog.
          key={composer.ticket?.id ?? `new-${composer.status}`}
          ticket={composer.ticket}
          initialStatus={composer.status}
          initialMeta={composer.ticket ? getMeta(composer.ticket.id) : DEFAULT_TICKET_META}
          onClose={() => setComposer(null)}
          onSubmit={(values) => void (composer.ticket ? editTicket(values) : createTicket(values))}
          onDelete={() => void deleteTicket()}
        />
      )}
    </div>
  );
}
