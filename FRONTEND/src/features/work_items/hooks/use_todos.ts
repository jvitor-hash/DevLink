import { useState, useEffect, useCallback } from "react";
import { todoService } from "../service/todo_service";
import type { TodoDTO, TodoCreate, TodoUpdate } from "@/shared/types/database";
import { toast } from "@/shared/utils/toast_store";

export function useTodos(projectId: string) {
  const [todos, setTodos] = useState<TodoDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    const result = await todoService.listTodosByProject(projectId);
    if (result.success && result.data) {
      setTodos(result.data);
    } else {
      setError(result.errors?.message || "Falha ao carregar tarefas.");
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = useCallback(async (data: TodoCreate) => {
    const result = await todoService.createTodo(data);
    if (result.success && result.data) {
      setTodos((prev) => [...prev, result.data!]);
      toast.success("Tarefa adicionada!");
      return result.data;
    } else {
      toast.error("Falha ao adicionar tarefa.");
      return null;
    }
  }, []);

  const toggleTodo = useCallback(async (todo: TodoDTO) => {
    const nextStatus = !todo.isDone;
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, isDone: nextStatus } : t))
    );

    const result = await todoService.updateTodo(todo.id, { isDone: nextStatus });
    if (!result.success) {
      toast.error("Erro ao atualizar tarefa.");
      fetchTodos();
    }
  }, [fetchTodos]);

  const updateTodo = useCallback(async (id: string, data: TodoUpdate) => {
    const result = await todoService.updateTodo(id, data);
    if (result.success && result.data) {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...result.data } : t)));
      return result.data;
    }
    return null;
  }, []);

  const removeTodo = useCallback(async (id: string) => {
    const result = await todoService.deleteTodo(id);
    if (result.success) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      toast.info("Tarefa removida.");
      return true;
    } else {
      toast.error("Falha ao remover tarefa.");
      return false;
    }
  }, []);

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
    refetch: fetchTodos,
  };
}
