import type { TodoDTO } from "@/shared/types/database";
import { Trash2 } from "react-feather";

interface TodoItemProps {
  todo: TodoDTO;
  onToggle: (todo: TodoDTO) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center justify-between p-3 border border-(--border-subtle) bg-(--surface-1) rounded-md group hover:border-(--border) transition-all">
      <label className="flex items-center gap-3 cursor-pointer flex-1">
        <input
          type="checkbox"
          checked={todo.isDone}
          onChange={() => onToggle(todo)}
          className="w-4 h-4 rounded border-(--border) text-(--primary) focus:ring-0 cursor-pointer"
        />
        <div className="flex flex-col">
          <span
            className={`text-sm ${
              todo.isDone
                ? "line-through text-(--text-muted)"
                : "text-(--text-primary) font-medium"
            }`}
          >
            {todo.title}
          </span>
          {todo.description && (
            <span className="text-xs text-(--text-secondary)">{todo.description}</span>
          )}
        </div>
      </label>

      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-(--text-muted) hover:text-(--error) transition-opacity cursor-pointer"
        title="Excluir tarefa"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
