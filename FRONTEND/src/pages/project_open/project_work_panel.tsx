import { useEffect, useState } from "react";
import { CheckCircle, Circle, Clock } from "react-feather";
import Button from "@/components/ui/button_component";
import Input from "@/components/ui/input_component";
import TextArea from "@/components/ui/textarea_component";
import Badge from "@/components/ui/badge_component";
import { todoService } from "@/services/todo_service";
import { ticketService } from "@/services/ticket_service";
import { authService } from "@/services/auth_service";
import type { TicketDTO, TicketStatus, TodoDTO } from "@/lib/types/database";
import ProgressBar from "@/components/ui/segmented_progress_bar_component";

const POLL_INTERVAL_MS = 5_000;

const KANBAN_COLUMNS: ReadonlyArray<{ key: TicketStatus; label: string }> = [
  { key: "BACKLOG", label: "Backlog" },
  { key: "IN_PROGRESS", label: "Em desenvolvimento" },
  { key: "REVIEW", label: "Revisão" },
  { key: "DONE", label: "Concluído" },
];

const columnBadgeType: Record<TicketStatus, "secondary" | "info" | "warning" | "success"> = {
  BACKLOG: "secondary",
  IN_PROGRESS: "info",
  REVIEW: "warning",
  DONE: "success",
};

type ProjectWorkPanelProps = {
  projectId: string;
};

/**
 * Collaborative work area: TODO checklist, Kanban board and a progress bar
 * derived from open/in-development items. Polls for live updates.
 */
export default function ProjectWorkPanel({ projectId }: ProjectWorkPanelProps) {
  const [todos, setTodos] = useState<TodoDTO[]>([]);
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const [newTodoTitle, setNewTodoTitle] = useState<string>("");
  const [newTodoDescription, setNewTodoDescription] = useState<string>("");

  const [showTicketForm, setShowTicketForm] = useState<boolean>(false);
  const [newTicketTitle, setNewTicketTitle] = useState<string>("");
  const [newTicketDescription, setNewTicketDescription] = useState<string>("");
  const [newTicketStatus, setNewTicketStatus] = useState<TicketStatus>("BACKLOG");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentUserId = authService.getCachedUser()?.id;

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const [todoList, ticketList] = await Promise.all([
          todoService.listByProject(projectId),
          ticketService.listByProject(projectId),
        ]);

        if (cancelled) return;

        setTodos(todoList);
        setTickets(ticketList);
        setError(null);
      } catch (loadError: unknown) {
        if (cancelled) return;

        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar tarefas.");
      }
    };

    void load();

    const poll = setInterval(() => {
      void load();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [projectId, refreshKey]);

  const doneTodos = todos.filter((todo) => todo.isDone).length;
  const totalItems = todos.length + tickets.length;
  const completedItems = doneTodos + tickets.filter((ticket) => ticket.status === "DONE").length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const addTodo = async (): Promise<void> => {
    const title = newTodoTitle.trim();

    if (!title || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await todoService.create({ projectId, title, description: newTodoDescription.trim() || null });
      setNewTodoTitle("");
      setNewTodoDescription("");
      setRefreshKey((prev) => prev + 1);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Não foi possível criar o TODO.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTodo = async (todo: TodoDTO): Promise<void> => {
    setTodos((prev) => prev.map((item) => (item.id === todo.id ? { ...item, isDone: !item.isDone } : item)));

    try {
      await todoService.update(todo.id, { isDone: !todo.isDone });
    } catch {
      setRefreshKey((prev) => prev + 1);
    }
  };

  const deleteTodo = async (todoId: string): Promise<void> => {
    try {
      await todoService.remove(todoId);
      setTodos((prev) => prev.filter((item) => item.id !== todoId));
    } catch {
      setRefreshKey((prev) => prev + 1);
    }
  };

  const addTicket = async (): Promise<void> => {
    const title = newTicketTitle.trim();

    if (!title || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await ticketService.create({
        projectId,
        title,
        description: newTicketDescription.trim() || null,
        status: newTicketStatus,
      });

      setNewTicketTitle("");
      setNewTicketDescription("");
      setNewTicketStatus("BACKLOG");
      setShowTicketForm(false);
      setRefreshKey((prev) => prev + 1);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Não foi possível criar o ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveTicket = async (ticket: TicketDTO, status: TicketStatus): Promise<void> => {
    if (ticket.status === status) return;

    setTickets((prev) => prev.map((item) => (item.id === ticket.id ? { ...item, status } : item)));

    try {
      await ticketService.update(ticket.id, { status });
      setRefreshKey((prev) => prev + 1);
    } catch {
      setRefreshKey((prev) => prev + 1);
    }
  };

  const deleteTicket = async (ticketId: string): Promise<void> => {
    try {
      await ticketService.remove(ticketId);
      setTickets((prev) => prev.filter((item) => item.id !== ticketId));
    } catch {
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress derived from todos + tickets */}
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-sm text-(--text-muted)">Progresso</span>

        <ProgressBar progress={totalItems === 0 ? 0 : completedItems / totalItems} segments={40} />

        <span className="shrink-0 text-sm font-semibold text-(--text-primary)">{progressPercent}%</span>
      </div>

      {error && <p className="text-sm text-(--error)">{error}</p>}

      {/* TODO checklist */}
      <section className="rounded-lg border border-(--border-subtle) bg-(--surface-1) p-4">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-(--text-primary)">
          <CheckCircle size={16} aria-hidden="true" />
          Checklist
        </h3>

        <ul className="mb-3 space-y-2">
          {todos.length === 0 ? (
            <li className="text-sm text-(--text-muted)">Nenhum ... ainda.</li>
          ) : (
            todos.map((todo) => (
              <li key={todo.id} className="flex items-start gap-2 rounded border border-(--border-subtle) p-2">
                <button
                  type="button"
                  onClick={() => void toggleTodo(todo)}
                  aria-label={todo.isDone ? "Marcar como pendente" : "Marcar como concluído"}
                  className="mt-0.5 shrink-0 hover:cursor-pointer"
                  data-testid="todo-toggle"
                >
                  {todo.isDone
                    ? <CheckCircle size={16} className="text-(--success)" aria-hidden="true" />
                    : <Circle size={16} className="text-(--text-muted)" aria-hidden="true" />}
                </button>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${todo.isDone ? "text-(--text-muted) line-through" : "text-(--text-primary)"}`}>
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-xs text-(--text-muted)">{todo.description}</p>
                  )}
                </div>

                {todo.creatorId === currentUserId && (
                  <button
                    type="button"
                    onClick={() => void deleteTodo(todo.id)}
                    aria-label="Remover TODO"
                    className="text-xs text-(--text-muted) hover:text-(--error)"
                  >
                    remover
                  </button>
                )}
              </li>
            ))
          )}
        </ul>

        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void addTodo();
          }}
        >
          <Input
            label=""
            name="newTodoTitle"
            placeholder="Novo TODO..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.currentTarget.value)}
            dataTestId="todo-title-input"
          />

          {newTodoTitle.trim() && (
            <TextArea
              name="newTodoDescription"
              label=""
              placeholder="Descrição (opcional)"
              value={newTodoDescription}
              onChange={(e) => setNewTodoDescription(e.currentTarget.value)}
            />
          )}

          <Button
            label="Adicionar TODO"
            buttonType="submit"
            colorType="secondary"
            disabled={!newTodoTitle.trim() || isSubmitting}
            dataTestId="add-todo-btn"
          />
        </form>
      </section>

      {/* Kanban board */}
      <section className="rounded-lg border border-(--border-subtle) bg-(--surface-1) p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-(--text-primary)">
            <Clock size={16} aria-hidden="true" />
            Tickets (Kanban)
          </h3>

          <Button
            label={showTicketForm ? "Cancelar" : "Novo ticket"}
            buttonType="button"
            colorType="secondary"
            onClick={() => setShowTicketForm((prev) => !prev)}
            className="!px-4 !py-1 text-xs"
            dataTestId="toggle-ticket-form-btn"
          />
        </div>

        {showTicketForm && (
          <form
            className="mb-3 flex flex-col gap-2 rounded border border-(--border-subtle) bg-(--surface-2) p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void addTicket();
            }}
          >
            <Input
              label=""
              name="newTicketTitle"
              placeholder="Título do ticket..."
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.currentTarget.value)}
              dataTestId="ticket-title-input"
            />

            <TextArea
              name="newTicketDescription"
              label=""
              placeholder="Descrição (opcional)"
              value={newTicketDescription}
              onChange={(e) => setNewTicketDescription(e.currentTarget.value)}
            />

            <label className="flex items-center gap-2 text-sm text-(--text-muted)">
              Coluna inicial:
              <select
                value={newTicketStatus}
                onChange={(e) => setNewTicketStatus(e.currentTarget.value as TicketStatus)}
                className="rounded border border-(--border-subtle) bg-(--surface-1) p-1 text-(--text-primary)"
              >
                {KANBAN_COLUMNS.map((column) => (
                  <option key={column.key} value={column.key}>{column.label}</option>
                ))}
              </select>
            </label>

            <Button
              label="Criar ticket"
              buttonType="submit"
              colorType="primary"
              disabled={!newTicketTitle.trim() || isSubmitting}
              dataTestId="create-ticket-btn"
            />
          </form>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {KANBAN_COLUMNS.map((column) => {
            const columnTickets = tickets.filter((ticket) => ticket.status === column.key);

            return (
              <div key={column.key} className="rounded border border-(--border-subtle) bg-(--surface-2) p-2" data-testid="kanban-column">
                <div className="mb-2 flex items-center justify-between">
                  <Badge label={column.label} badgeType={columnBadgeType[column.key]} />
                  <span className="text-xs text-(--text-muted)">{columnTickets.length}</span>
                </div>

                <ul className="space-y-2">
                  {columnTickets.length === 0 ? (
                    <li className="py-2 text-center text-xs text-(--text-muted)">Vazio</li>
                  ) : (
                    columnTickets.map((ticket) => (
                      <li key={ticket.id} className="rounded border border-(--border-subtle) bg-(--surface-1) p-2" data-testid="kanban-ticket">
                        <p className="text-sm font-medium text-(--text-primary)">{ticket.title}</p>
                        {ticket.description && (
                          <p className="mt-1 text-xs text-(--text-muted)">{ticket.description}</p>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-1">
                          <select
                            value={ticket.status}
                            aria-label="Mover ticket"
                            onChange={(e) => void moveTicket(ticket, e.currentTarget.value as TicketStatus)}
                            className="rounded border border-(--border-subtle) bg-(--surface-2) p-0.5 text-xs text-(--text-secondary)"
                          >
                            {KANBAN_COLUMNS.map((option) => (
                              <option key={option.key} value={option.key}>{option.label}</option>
                            ))}
                          </select>

                          {ticket.creatorId === currentUserId && (
                            <button
                              type="button"
                              onClick={() => void deleteTicket(ticket.id)}
                              aria-label="Remover ticket"
                              className="text-xs text-(--text-muted) hover:text-(--error)"
                            >
                              remover
                            </button>
                          )}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
