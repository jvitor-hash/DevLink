import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";

const ENDPOINT = "/api/v1/reviews";

export interface ReceivedReviewDTO {
  review: any;
  reviewer: { id: string; name: string; image?: string | null };
  project: { id: string; title: string };
}

class ReviewService {
  async createReview(data): Promise<ServiceRequestInterface> {
    try {
      const result = await APIClient.post<any>(ENDPOINT, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao criar avaliação") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async listReviews(params): Promise<ServiceRequestInterface<any[]>> {
    try {
      const result = await APIClient.get<any[]>(ENDPOINT, params);
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async listReviewsByUser(userId: string, params): Promise<ServiceRequestInterface<any[]>> {
    try {
      const result = await APIClient.get<any[]>(`${ENDPOINT}/by-user/${userId}`, params);
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async getReviewById(id: string): Promise<ServiceRequestInterface> {
    try {
      const result = await APIClient.get<any>(`${ENDPOINT}/${id}`);
      if (!result) return { success: false, data: null, errors: new Error("Avaliação não encontrada") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async updateReview(id: string, data): Promise<ServiceRequestInterface> {
    try {
      const result = await APIClient.put<any>(`${ENDPOINT}/${id}`, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao atualizar avaliação") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async deleteReview(id: string): Promise<ServiceRequestInterface> {
    try {
      const result = await APIClient.delete<any>(`${ENDPOINT}/${id}`);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao excluir avaliação") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const reviewService = new ReviewService();
