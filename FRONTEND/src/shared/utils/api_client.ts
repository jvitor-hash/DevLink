import { BASE_URL } from "../lib/environment";

const buildQuery = (params: Record<string, any> = {}): string => {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      for (const item of value) query.append(key, String(item));
      continue;
    }

    query.set(key, String(value));
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  async get<T>(path: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(`${path}${buildQuery(params)}`, { method: "GET", headers });
  }

  async post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  async put<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: "DELETE", headers });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const baseUrl = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    const url = `${baseUrl}${normalizedPath}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        credentials: "include",
        headers,
      });
    } catch (networkError: any) {
      console.error(`Network Error connecting to ${url}:`, networkError);
      throw new ApiError(
        `Falha ao conectar com o servidor da API (${url}). Verifique se o backend está em execução.`,
        0,
        networkError
      );
    }

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        // Not a JSON response
      }

      const message =
        errorData?.error ||
        errorData?.message ||
        `Erro ${response.status}: ${response.statusText || "Falha na requisição"}`;

      console.warn(`[API] ${init.method || "GET"} ${url} failed with status ${response.status}:`, message);
      throw new ApiError(message, response.status, errorData);
    }

    if (response.status === 204) return undefined as T;

    try {
      return (await response.json()) as T;
    } catch {
      return undefined as T;
    }
  }
}

export const APIClient = new ApiClient();
