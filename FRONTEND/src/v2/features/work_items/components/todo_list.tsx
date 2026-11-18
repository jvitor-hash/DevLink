import { useState } from "react";
import { ULIB } from "@/shared/ui";
import { TodoItem } from "./todo_item";
import { useTodos } from "../hooks/use_todos";
import { Plus } from "react-feather";

interface TodoListProps {
  projectId: string;
}

export function TodoList({ projectId }: TodoListProps) {
  const { todos, loading, addTodo, toggleTodo, removeTodo } = useTodos(projectId);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    await addTodo({
      projectId,
      title: newTitle.trim(),
      description: newDesc.trim() || null,
    });
    setNewTitle("");
    setNewDesc("");
    setSubmitting(false);
  };

  const doneCount = todos.filter((t) => t.isDone).length;
  const progressPercent = todos.length > 0 ? Math.round((doneCount / todos.length) * 100) : 0;

  if (loading) {
    return <div className="p-8 text-center text-sm text-(--text-muted)">Carregando tarefas...</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl">
      <div className="flex items-center justify-between p-3 border border-(--border-subtle) bg-(--surface-2)/30 rounded-md">
        <div>
          <h3 className="font-semibold text-sm">Progresso de Tarefas</h3>
          <span className="text-xs text-(--text-muted)">
            {doneCount} de {todos.length} concluídas ({progressPercent}%)
          </span>
        </div>
        <div className="w-32 h-2.5 bg-(--surface-1) border border-(--border) rounded-full overflow-hidden">
          <div
            className="h-full bg-(--success) transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 p-3 border border-(--border) bg-(--surface-1) rounded-md">
        <div className="flex gap-2">
          <ULIB.input
            placeholder="Nova tarefa a fazer..."
            value={newTitle}
            onChange={(e: any) => setNewTitle(e.target.value)}
            className="flex-1 text-sm"
            required
          />
          <ULIB.button type="submit" disabled={submitting} className="shrink-0">
            <Plus size={16} /> Adicionar
          </ULIB.button>
        </div>
        <ULIB.input
          placeholder="Descrição opcional..."
          value={newDesc}
          onChange={(e: any) => setNewDesc(e.target.value)}
          className="text-xs text-(--text-secondary)"
        />
      </form>

      <div className="flex flex-col gap-2">
        {todos.length === 0 && (
          <p className="text-sm text-(--text-muted) italic text-center py-6">
            Nenhuma tarefa criada para este projeto.
          </p>
        )}

        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={removeTodo}
          />
        ))}
      </div>
    </div>
  );
}
