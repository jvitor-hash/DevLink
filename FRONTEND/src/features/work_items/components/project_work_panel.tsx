import { useState } from "react";
import { KanbanBoard } from "./kanban_board";
import { TodoList } from "./todo_list";
import { Trello, CheckSquare } from "react-feather";

interface ProjectWorkPanelProps {
  projectId: string;
}

export function ProjectWorkPanel({ projectId }: ProjectWorkPanelProps) {
  const [activeTab, setActiveTab] = useState<"kanban" | "todos">("kanban");

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2 border-b border-(--border-subtle) pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("kanban")}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "kanban"
              ? "bg-(--surface-2) text-(--text-primary) border border-(--border)"
              : "text-(--text-muted) hover:text-(--text-primary)"
          }`}
        >
          <Trello size={16} /> Quadro Kanban
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("todos")}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "todos"
              ? "bg-(--surface-2) text-(--text-primary) border border-(--border)"
              : "text-(--text-muted) hover:text-(--text-primary)"
          }`}
        >
          <CheckSquare size={16} /> Tarefas Rápidas (To-Do)
        </button>
      </div>

      <div>
        {activeTab === "kanban" ? (
          <KanbanBoard projectId={projectId} />
        ) : (
          <TodoList projectId={projectId} />
        )}
      </div>
    </div>
  );
}
