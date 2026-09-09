import { BASE_URL, type ApiError, type PaginationParams } from "@/lib/types/database";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.status = error.status;
    this.data = error.data;
  }
}

class ApiClient {
  async get<T>(path: string, params?: Pick<PaginationParams, "limit" | "offset">): Promise<T> {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.offset !== undefined) query.set("offset", String(params.offset));
    const queryString = query.toString();
    return this.request<T>(queryString ? `${path}?${queryString}` : path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: "PUT", body: JSON.stringify(body) });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => undefined)) as { error?: string; message?: string } | undefined;
      throw new ApiRequestError({
        status: response.status,
        message: data?.message ?? data?.error ?? `Request failed with status ${response.status}`,
        data,
      });
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }
}

export const apiClient = new ApiClient();
