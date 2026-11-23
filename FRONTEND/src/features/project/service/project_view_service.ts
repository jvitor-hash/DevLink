import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import type { ProjectFetchListQuery } from "@/features/project/types/project_fetch_list_query";
import type { ProjectDTO } from "@/shared/types/database";

class ProjectViewService {
  async fetchProjects(listQuery: ProjectFetchListQuery = {}): Promise<ServiceRequestInterface<ProjectDTO[]>> {
    try {
      const result = await APIClient.get<ProjectDTO[]>("/api/v1/projects", { ...listQuery });

      if (!result)
        return { success: false, data: null, errors: new Error("Falha ao buscar projetos") };

      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async fetchProjectById(id: string): Promise<ServiceRequestInterface<ProjectDTO>> {
    try {
      const result = await APIClient.get<ProjectDTO>(`/api/v1/projects/${id}`);

      if (!result)
        return { success: false, data: null, errors: new Error("Projeto não encontrado") };

      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async fetchProjectsByClient(clientId: string): Promise<ServiceRequestInterface<{ counts: Record<string, number> }>> {
    try {
      const result = await APIClient.get<{ counts: Record<string, number> }>("/api/v1/projects/counts/by-client", {
        clientIds: clientId,
      });

      if (!result)
        return { success: false, data: null, errors: new Error("Falha ao buscar contagem de projetos por cliente") };

      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async fetchProjectsByCategory(excludeStatuses?: string[]): Promise<ServiceRequestInterface<{ counts: Record<string, number> }>> {
    try {
      const result = await APIClient.get<{ counts: Record<string, number> }>("/api/v1/projects/counts/by-category", {
        excludeStatuses,
      });

      if (!result)
        return { success: false, data: null, errors: new Error("Falha ao buscar contagem por categoria") };

      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async fetchSavedProjects(params: { limit?: number; offset?: number } = {}): Promise<ServiceRequestInterface<ProjectDTO[]>> {
    try {
      const result = await APIClient.get<ProjectDTO[]>("/api/v1/projects/saved", params);

      if (!result)
        return { success: false, data: null, errors: new Error("Falha ao buscar projetos salvos") };

      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const projectViewService = new ProjectViewService();
