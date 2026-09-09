import type { PaginationParams, ReviewCreate, ReviewDTO, ReviewUpdate } from "@/lib/types/database";
import { apiClient } from "./api_client";

const endpoint = "/api/v1/reviews";

export const reviewService = {
  create: (data: ReviewCreate) => apiClient.post<ReviewDTO>(endpoint, data),
  list: (params?: Pick<PaginationParams, "limit" | "offset">) => apiClient.get<ReviewDTO[]>(endpoint, params),
  getById: (id: string) => apiClient.get<ReviewDTO>(`${endpoint}/${id}`),
  update: (id: string, data: ReviewUpdate) => apiClient.put<ReviewDTO>(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete<ReviewDTO>(`${endpoint}/${id}`),
};
