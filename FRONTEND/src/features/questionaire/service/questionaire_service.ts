import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import type { ProjectCreate, ProjectDTO } from "@/shared/types/database";

const ENDPOINT = "/api/v1/projects";

class QuestionaireService {
  async submitProject(data: ProjectCreate): Promise<ServiceRequestInterface<ProjectDTO>> {
    try {
      const result = await APIClient.post<ProjectDTO>(ENDPOINT, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao criar o projeto") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const questionaireService = new QuestionaireService();
