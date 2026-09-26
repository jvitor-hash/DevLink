import { useState } from "react";
import { Box, CheckCircle } from "react-feather";
import type { TicketDTO, TicketStatus, TodoDTO } from "@/data/types/database";

const COLUMNS: ReadonlyArray<{ status: TicketStatus; label: string }> = [
  { status: "BACKLOG",     label: "Backlog" },
  { status: "IN_PROGRESS", label: "Em andamento" },
  { status: "BLOCKED",     label: "Bloqueado" },
  { status: "REVIEW",      label: "Validação" },
  { status: "DONE",        label: "Finalizado" },
];

type Props = { projectId: string };

export default function ProjectWorkPanel({ projectId }: Props) {
  const [todos, setTodos] = useState<TodoDTO[]>([]);
  const [tickets, setTickets] = useState<TicketDTO[]>([]);

  // Validate whether the user is assigned to the project or not to be visible.
  const validateAssignment = () => { };

  // After the user submits the modal, this function is called to add the new kanban ticket
  const addKanbanTicket = () => {
    setTodos((current) => [
      ...current
    ]);
  };

  // After the user presses enter a new item is added to the checklist.
  const addTodoChecklist = () => {
    setTickets((current) => [
      ...current
    ])
  };

  return <div className="border border-(--border-subtle) rounded-md bg-(--surface-1) p-4">
    <div className="flex gap-4">
      {/* Checklist / Todos */}
      <section className="w-1/3 border-r border-(--border) pr-4">
        <header className="flex items-center gap-2">
          <CheckCircle size={16} /> Checklist
        </header>

      </section>

      {/* Kanban board */}
      <section className="flex-1">
        <header className="mb-2 flex items-center gap-2">
          <Box size={18} /> Board
        </header>

        <main className="flex justify-between gap-2">
          {COLUMNS.map((column) => (
            <div className="flex-1 flex flex-col bg-(--surface-2) p-4 rounded-sm border border-(--border-subtle)">
              <p>{column.label}</p>
            </div>
          ))}
        </main>
      </section>
    </div>
  </div>;
}
