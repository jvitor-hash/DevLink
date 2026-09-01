const BASE_URL = "http://127.0.0.1:8888";

type ApiError = {
  status: number;
  message: string;
  data?: unknown;
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("AccessToken");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? {
            Authorization: `Bearer ${token}`,
          }: {}),
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
        typeof data.message === "string"
          ? data.message
          : "API request failed",
      data,
    };

    throw error;
  }

  return data as T;
}

const API = {
  get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | null | undefined>
  ): Promise<T> {
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

    return request<T>(url, {
      method: "GET",
    });
  },

  post<TResponse, TBody = unknown>(
    endpoint: string,
    payload?: TBody
  ): Promise<TResponse> {
    return request<TResponse>(endpoint, {
      method: "POST",
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });
  },

  patch<TResponse, TBody = unknown>(
    endpoint: string,
    payload?: TBody
  ): Promise<TResponse> {
    return request<TResponse>(endpoint, {
      method: "PATCH",
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });
  },

  put<TResponse, TBody = unknown>(
    endpoint: string,
    payload?: TBody
  ): Promise<TResponse> {
    return request<TResponse>(endpoint, {
      method: "PUT",
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });
  },

  delete<TResponse, TBody = unknown>(
    endpoint: string,
    payload?: TBody
  ): Promise<TResponse> {
    return request<TResponse>(endpoint, {
      method: "DELETE",
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });
  },
};

export default API;
