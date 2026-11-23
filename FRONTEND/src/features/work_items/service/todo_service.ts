import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import type { PaginationParams, TodoCreate, TodoDTO, TodoUpdate } from "@/shared/types/database";

const ENDPOINT = "/api/v1/todos";

class TodoService {
  async createTodo(data: TodoCreate): Promise<ServiceRequestInterface<TodoDTO>> {
    try {
      const result = await APIClient.post<TodoDTO>(ENDPOINT, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao criar todo") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async listTodos(params?: Pick<PaginationParams, "limit" | "offset">): Promise<ServiceRequestInterface<TodoDTO[]>> {
    try {
      const result = await APIClient.get<TodoDTO[]>(ENDPOINT, params);
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async listTodosByProject(projectId: string): Promise<ServiceRequestInterface<TodoDTO[]>> {
    try {
      const result = await APIClient.get<TodoDTO[]>(`${ENDPOINT}/project/${projectId}`);
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async updateTodo(id: string, data: TodoUpdate): Promise<ServiceRequestInterface<TodoDTO>> {
    try {
      const result = await APIClient.put<TodoDTO>(`${ENDPOINT}/${id}`, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao atualizar todo") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async deleteTodo(id: string): Promise<ServiceRequestInterface<TodoDTO>> {
    try {
      const result = await APIClient.delete<TodoDTO>(`${ENDPOINT}/${id}`);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao remover todo") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async countByProjects(projectIds: string[]): Promise<ServiceRequestInterface<{ counts: Record<string, { total: number; done: number }> }>> {
    try {
      const result = await APIClient.get<{ counts: Record<string, { total: number; done: number }> }>(`${ENDPOINT}/counts`, {
        projectIds: projectIds.join(","),
      });
      return { success: true, data: result ?? { counts: {} }, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const todoService = new TodoService();
