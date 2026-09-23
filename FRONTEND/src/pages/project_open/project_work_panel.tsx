import { useEffect, useMemo, useState } from "react";
import { Box, CheckCircle } from "react-feather";
import type { TicketDTO, TicketStatus, TodoDTO } from "@/lib/types/database";
import { ticketService } from "@/services/ticket_service";
import { todoService } from "@/services/todo_service";
import ProgressBar from "@/components/ui/segmented_progress_bar_component";
import Checkbox from "@/components/ui/checkbox_component";

const COLUMNS: ReadonlyArray<{ status: TicketStatus; label: string }> = [
  { status: "BACKLOG", label: "Backlog" }, { status: "IN_PROGRESS", label: "Em andamento" },
  { status: "REVIEW", label: "Validação" }, { status: "DONE", label: "Finalizado" },
];

type Props = { projectId: string };

export default function ProjectWorkPanel({ projectId }: Props) {
  const [todos, setTodos] = useState<TodoDTO[]>([]);
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newTicket, setNewTicket] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    try {
      const [loadedTodos, loadedTickets] = await Promise.all([todoService.listByProject(projectId), ticketService.listByProject(projectId)]);
      setTodos(loadedTodos); setTickets(loadedTickets); setError(null);
    } catch (loadError: unknown) { setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o quadro."); }
  };

  useEffect(() => { void load(); }, [projectId]);

  const completed = todos.filter((todo) => todo.isDone).length;
  const progress = todos.length ? Math.round((completed / todos.length) * 100) : 0;
  const groupedTickets = useMemo(() => COLUMNS.map((column) => ({ ...column, tickets: tickets.filter((ticket) => ticket.status === column.status) })), [tickets]);

  const createTodo = async (): Promise<void> => {
    const title = newTodo.trim(); if (!title) return;
    try { const todo = await todoService.create({ projectId, title }); setTodos((current) => [...current, todo]); setNewTodo(""); } catch { setError("Não foi possível criar a tarefa."); }
  };

  const updateTodo = async (todo: TodoDTO, isDone: boolean): Promise<void> => {
    try { const updated = await todoService.update(todo.id, { isDone }); setTodos((current) => current.map((item) => item.id === updated.id ? updated : item)); } catch { setError("Não foi possível atualizar a tarefa."); }
  };

  const removeTodo = async (id: string): Promise<void> => {
    try { await todoService.remove(id); setTodos((current) => current.filter((todo) => todo.id !== id)); } catch { setError("Não foi possível remover a tarefa."); }
  };

  const createTicket = async (status: TicketStatus): Promise<void> => {
    const title = newTicket.trim(); if (!title) return;
    try { const ticket = await ticketService.create({ projectId, title, status }); setTickets((current) => [...current, ticket]); setNewTicket(""); } catch { setError("Não foi possível criar o cartão."); }
  };

  const moveTicket = async (ticket: TicketDTO, status: TicketStatus): Promise<void> => {
    if (ticket.status === status) return;
    try { const updated = await ticketService.update(ticket.id, { status }); setTickets((current) => current.map((item) => item.id === updated.id ? updated : item)); } catch { setError("Não foi possível mover o cartão."); }
  };

  const removeTicket = async (id: string): Promise<void> => {
    try { await ticketService.remove(id); setTickets((current) => current.filter((ticket) => ticket.id !== id)); } catch { setError("Não foi possível remover o cartão."); }
  };

  return <div className="border border-(--border-subtle) rounded-md bg-(--surface-1) p-4">
    {error && <p className="mb-3 text-(--error)">{error}</p>}
    <div className="mb-4 flex items-center gap-2"><span>Progresso:</span><ProgressBar progress={progress} segments={40} /></div>
    <div className="flex gap-4">
      <section className="w-1/3 border-r border-(--border) pr-4"><header className="flex items-center gap-2"><CheckCircle size={16} /> Checklist</header>
        <div className="mt-2 flex gap-2"><input className="min-w-0 flex-1 border-b bg-transparent p-1" placeholder="Nova tarefa" value={newTodo} onChange={(event) => setNewTodo(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void createTodo(); }} /><button type="button" onClick={() => void createTodo()}>+</button></div>
        <div className="mt-3 flex flex-col gap-2">{todos.map((todo) => <div key={todo.id} className="flex items-center justify-between gap-2"><Checkbox label={todo.title} checked={todo.isDone} onToggle={(checked) => void updateTodo(todo, checked)} /><button type="button" onClick={() => void removeTodo(todo.id)} aria-label="Remover tarefa">×</button></div>)}</div>
      </section>
      <section className="min-w-0 flex-1"><header className="mb-2 flex items-center gap-2"><Box size={18} /> Board</header>
        <div className="mb-2 flex gap-2"><input className="min-w-0 flex-1 border-b bg-transparent p-1" placeholder="Novo cartão" value={newTicket} onChange={(event) => setNewTicket(event.target.value)} /><span className="self-center text-xs text-(--text-muted)">Escolha a coluna para criar</span></div>
        <main className="flex gap-2 overflow-x-auto">{groupedTickets.map((column) => <div key={column.status} className="min-h-48 min-w-48 flex-1 rounded-sm border border-(--border-subtle) bg-(--surface-2) p-2" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const ticket = tickets.find((item) => item.id === event.dataTransfer.getData("ticket-id")); if (ticket) void moveTicket(ticket, column.status); }}><div className="mb-2 font-semibold">{column.label}</div>{column.tickets.map((ticket) => <article key={ticket.id} draggable onDragStart={(event) => event.dataTransfer.setData("ticket-id", ticket.id)} className="mb-2 rounded border border-(--border) bg-(--surface-3) p-3"><div className="flex justify-between gap-2"><span>{ticket.title}</span><button type="button" onClick={() => void removeTicket(ticket.id)}>×</button></div><select value={ticket.status} onChange={(event) => void moveTicket(ticket, event.target.value as TicketStatus)}><option value="BACKLOG">Backlog</option><option value="IN_PROGRESS">Em andamento</option><option value="REVIEW">Validação</option><option value="DONE">Finalizado</option></select></article>)}<button type="button" className="w-full border border-dashed p-2" onClick={() => void createTicket(column.status)}>+ Criar</button></div>)}</main>
      </section>
    </div>
  </div>;
}
