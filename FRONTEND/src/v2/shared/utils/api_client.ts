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

class ApiClient {
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(`${path}${buildQuery(params)}`);
  }

  post<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body), headers });
  }

  put<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: "PUT", body: JSON.stringify(body), headers });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init.headers },
    });

    if (!response.ok) {
      console.error(`Request Failed: ${BASE_URL}${path}`);
      return undefined as T;
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }
}