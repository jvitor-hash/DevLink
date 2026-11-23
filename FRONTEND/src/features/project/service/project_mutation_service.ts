import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import type { ProjectCreate, ProjectDTO, ProjectUpdate } from "@/shared/types/database";

class ProjectMutationService {
  async createProject(data: ProjectCreate): Promise<ServiceRequestInterface<ProjectDTO>> {
    try {
      const result = await APIClient.post<ProjectDTO>("/api/v1/projects", data);

      if (!result) {
        return { success: false, data: null, errors: new Error("Falha ao criar projeto") };
      }

      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async updateProject(id: string, data: ProjectUpdate): Promise<ServiceRequestInterface<ProjectDTO>> {
    try {
      const result = await APIClient.put<ProjectDTO>(`/api/v1/projects/${id}`, data);

      if (!result) {
        return { success: false, data: null, errors: new Error("Falha ao atualizar projeto") };
      }

      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async deleteProject(id: string): Promise<ServiceRequestInterface<ProjectDTO>> {
    try {
      const result = await APIClient.delete<ProjectDTO>(`/api/v1/projects/${id}`);

      if (!result) {
        return { success: false, data: null, errors: new Error("Falha ao excluir projeto") };
      }

      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const projectMutationService = new ProjectMutationService();
