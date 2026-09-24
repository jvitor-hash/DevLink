import { useState } from "react";
import { Box, CheckCircle } from "react-feather";
import type { TicketDTO, TicketStatus, TodoDTO } from "@/lib/types/database";

const COLUMNS: ReadonlyArray<{ status: TicketStatus; label: string }> = [
  { status: "BACKLOG",     label: "Backlog" }, 
  { status: "IN_PROGRESS", label: "Em andamento" },
  { status: "REVIEW",      label: "Validação" }, 
  { status: "DONE",        label: "Finalizado" },
];

type Props = { projectId: string };

export default function ProjectWorkPanel({ projectId }: Props) {
  const [todos, setTodos] = useState<TodoDTO[]>([]);
  const [tickets, setTickets] = useState<TicketDTO[]>([]);

  // Validate whether the user is assigned to the project or not to be visible.
  const validateAssignment = () => {};

  return <div className="border border-(--border-subtle) rounded-md bg-(--surface-1) p-4">
    <div className="flex gap-4">
      {/* Checklist / Todos */}
      <section className="w-1/3 border-r border-(--border) pr-4"><header className="flex items-center gap-2"><CheckCircle size={16} /> Checklist</header>
        
      </section>

      {/* Kanban board */}
      <section className="min-w-0 flex-1">
        <header className="mb-2 flex items-center gap-2">
          <Box size={18} /> Board
        </header>
        
      </section>
    </div>
  </div>;
}
