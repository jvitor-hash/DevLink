import type {
  ApiError,
  PaginationParams,
  ProjectDTO,
  ProjectCreate,
  ProjectUpdate,
  NotificationDTO,
  NotificationCreate,
  NotificationUpdate,
  MessageDTO,
  MessageCreate,
  MessageUpdate,
  ReviewDTO,
  ReviewCreate,
  ReviewUpdate,
  SavedTicketDTO,
  SavedTicketCreate,
  UserPreferenceDTO,
  UserPreferenceCreate,
  UserPreferenceUpdate,
} from "./types";

export type { ApiError };

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("AccessToken")
      : null;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message:
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
          ? (data as { message: string }).message
          : typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : "API request failed",
      data,
    };

    throw error;
  }

  return data as T;
}

export const apiClient = {
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    let url = endpoint;

    if (params) {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();

      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return request<T>(url, { method: "GET" });
  },

  post<TResponse, TBody = unknown>(endpoint: string, payload?: TBody): Promise<TResponse> {
    return request<TResponse>(endpoint, {
      method: "POST",
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });
  },

  patch<TResponse, TBody = unknown>(endpoint: string, payload?: TBody): Promise<TResponse> {
    return request<TResponse>(endpoint, {
      method: "PATCH",
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });
  },

  put<TResponse, TBody = unknown>(endpoint: string, payload?: TBody): Promise<TResponse> {
    return request<TResponse>(endpoint, {
      method: "PUT",
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });
  },

  delete<TResponse, TBody = unknown>(endpoint: string, payload?: TBody): Promise<TResponse> {
    return request<TResponse>(endpoint, {
      method: "DELETE",
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });
  },
};

// Route API services
export const projectsApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<ProjectDTO[]>("/api/v1/projects", params),
  getById: (id: string) =>
    apiClient.get<ProjectDTO>(`/api/v1/projects/${id}`),
  create: (data: ProjectCreate) =>
    apiClient.post<ProjectDTO, ProjectCreate>("/api/v1/projects", data),
  update: (id: string, data: ProjectUpdate) =>
    apiClient.put<ProjectDTO, ProjectUpdate>(`/api/v1/projects/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<ProjectDTO>(`/api/v1/projects/${id}`),
};

export const notificationApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<NotificationDTO[]>("/api/v1/notification", params),
  getById: (id: string) =>
    apiClient.get<NotificationDTO>(`/api/v1/notification/${id}`),
  create: (data: NotificationCreate) =>
    apiClient.post<NotificationDTO, NotificationCreate>(
      "/api/v1/notification",
      data
    ),
  update: (id: string, data: NotificationUpdate) =>
    apiClient.put<NotificationDTO, NotificationUpdate>(
      `/api/v1/notification/${id}`,
      data
    ),
  delete: (id: string) =>
    apiClient.delete<NotificationDTO>(`/api/v1/notification/${id}`),
};

export const messageApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<MessageDTO[]>("/api/v1/message/", params),
  getById: (id: string) =>
    apiClient.get<MessageDTO>(`/api/v1/message/${id}`),
  create: (data: MessageCreate) =>
    apiClient.post<MessageDTO, MessageCreate>("/api/v1/message/", data),
  update: (id: string, data: MessageUpdate) =>
    apiClient.put<MessageDTO, MessageUpdate>(`/api/v1/message/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<MessageDTO>(`/api/v1/message/${id}`),
};

export const reviewApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<ReviewDTO[]>("/api/v1/reviews", params),
  getById: (id: string) =>
    apiClient.get<ReviewDTO>(`/api/v1/reviews/${id}`),
  create: (data: ReviewCreate) =>
    apiClient.post<ReviewDTO, ReviewCreate>("/api/v1/reviews", data),
  update: (id: string, data: ReviewUpdate) =>
    apiClient.put<ReviewDTO, ReviewUpdate>(`/api/v1/reviews/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<{ id: number }>(`/api/v1/reviews/${id}`),
};

export const savedTicketApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<SavedTicketDTO[]>("/api/v1/saved_ticket", params),
  getById: (id: string) =>
    apiClient.get<SavedTicketDTO>(`/api/v1/saved_ticket/${id}`),
  create: (data: SavedTicketCreate) =>
    apiClient.post<SavedTicketDTO, SavedTicketCreate>(
      "/api/v1/saved_ticket",
      data
    ),
  delete: (id: string) =>
    apiClient.delete<SavedTicketDTO>(`/api/v1/saved_ticket/${id}`),
};

export const userPreferenceApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<UserPreferenceDTO[]>("/api/v1/user_preferences", params),
  getById: (id: string) =>
    apiClient.get<UserPreferenceDTO>(`/api/v1/user_preferences/${id}`),
  create: (data: UserPreferenceCreate) =>
    apiClient.post<UserPreferenceDTO, UserPreferenceCreate>(
      "/api/v1/user_preferences",
      data
    ),
  update: (id: string, data: UserPreferenceUpdate) =>
    apiClient.put<UserPreferenceDTO, UserPreferenceUpdate>(
      `/api/v1/user_preferences/${id}`,
      data
    ),
  delete: (id: string) =>
    apiClient.delete<UserPreferenceDTO>(`/api/v1/user_preferences/${id}`),
};

export const healthApi = {
  check: () => apiClient.get<{ OK: boolean }>("/health"),
};

const API = {
  ...apiClient,
  projects: projectsApi,
  notifications: notificationApi,
  messages: messageApi,
  reviews: reviewApi,
  savedTickets: savedTicketApi,
  userPreferences: userPreferenceApi,
  health: healthApi,
};

export default API;
