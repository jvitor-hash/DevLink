import { APIClient } from "@/shared/utils/api_client";
import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import type { ReviewCreate, ReviewDTO, ReviewUpdate, PaginationParams } from "@/shared/types/database";

const ENDPOINT = "/api/v1/reviews";

export interface ReceivedReviewDTO {
  review: ReviewDTO;
  reviewer: { id: string; name: string; image?: string | null };
  project: { id: string; title: string };
}

class ReviewService {
  async createReview(data: ReviewCreate): Promise<ServiceRequestInterface<ReviewDTO>> {
    try {
      const result = await APIClient.post<ReviewDTO>(ENDPOINT, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao criar avaliação") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async listReviews(params?: Pick<PaginationParams, "limit" | "offset">): Promise<ServiceRequestInterface<ReviewDTO[]>> {
    try {
      const result = await APIClient.get<ReviewDTO[]>(ENDPOINT, params);
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async listReviewsByUser(userId: string, params?: Pick<PaginationParams, "limit" | "offset">): Promise<ServiceRequestInterface<ReceivedReviewDTO[]>> {
    try {
      const result = await APIClient.get<ReceivedReviewDTO[]>(`${ENDPOINT}/by-user/${userId}`, params);
      return { success: true, data: result ?? [], errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async getReviewById(id: string): Promise<ServiceRequestInterface<ReviewDTO>> {
    try {
      const result = await APIClient.get<ReviewDTO>(`${ENDPOINT}/${id}`);
      if (!result) return { success: false, data: null, errors: new Error("Avaliação não encontrada") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async updateReview(id: string, data: ReviewUpdate): Promise<ServiceRequestInterface<ReviewDTO>> {
    try {
      const result = await APIClient.put<ReviewDTO>(`${ENDPOINT}/${id}`, data);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao atualizar avaliação") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async deleteReview(id: string): Promise<ServiceRequestInterface<ReviewDTO>> {
    try {
      const result = await APIClient.delete<ReviewDTO>(`${ENDPOINT}/${id}`);
      if (!result) return { success: false, data: null, errors: new Error("Falha ao excluir avaliação") };
      return { success: true, data: result, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const reviewService = new ReviewService();
