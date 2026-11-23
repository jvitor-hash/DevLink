import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";

class ProjectSaveService {
  async saveProject(projectId: string): Promise<ServiceRequestInterface<{ success: boolean }>> {
    try {
      const result = await APIClient.post<{ success: boolean }>("/api/v1/projects/actions", {
        type: "SAVE_PROJECT",
        payload: { projectId },
      });

      if (!result) {
        return { success: false, data: null, errors: new Error("Falha ao salvar projeto") };
      }

      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async unsaveProject(projectId: string): Promise<ServiceRequestInterface<{ success: boolean }>> {
    try {
      const result = await APIClient.post<{ success: boolean }>("/api/v1/projects/actions", {
        type: "UNSAVE_PROJECT",
        payload: { projectId },
      });

      if (!result) {
        return { success: false, data: null, errors: new Error("Falha ao remover projeto salvo") };
      }

      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const projectSaveService = new ProjectSaveService();
