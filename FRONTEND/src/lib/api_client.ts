import { BASE_URL, type ApiError } from "@/lib/types/database";

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

type QueryValue = string | number | boolean | null | undefined | string[];

const buildQuery = (params: Record<string, QueryValue> = {}): string => {
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

const FIELD_LABELS: Record<string, string> = {
  title: "Titulo",
  description: "Descricao",
  category: "Categoria",
  sub_category: "Sub-categoria",
  platforms: "Plataformas",
  primaryLanguage: "Linguagem",
  audience: "Publico-alvo",
  minBudget: "Orcamento minimo",
  maxBudget: "Orcamento maximo",
  deadline: "Prazo",
  problem: "Problema",
  user_actions: "Acoes do usuario",
  affectedUsers: "Usuarios afetados",
  northQuestion: "Questao norte",
  hypothesis: "Hipotese",
  audiencePainPoints: "Pontos de dor",
  audienceAssumptions: "Suposicoes",
  notAudience: "Quem nao e o usuario-alvo",
  requirements: "Requisitos",
  successCriteria: "Criterios de sucesso",
  valueProposition: "Proposta de valor",
  differentiation: "Diferenciais",
  email: "E-mail",
  password: "Senha",
  name: "Nome",
  rating: "Nota",
  maxDeadlineDays: "Prazo maximo",
  language: "Idioma",
  platform: "Plataforma",
  status: "Status",
};

const translateValidationMessage = (message: string): string => {
  if (message.startsWith("Too small")) return "Valor muito curto";
  if (message.startsWith("Too big")) return "Valor muito grande";
  if (message.includes("Invalid input: expected number")) return "Informe um numero valido";
  if (message.includes("Invalid input: expected string")) return "Campo obrigatorio nao informado";
  if (message.startsWith("Invalid option")) return "Valor fora das opcoes permitidas";
  if (message.startsWith("Invalid input")) return "Valor invalido";
  return message;
};

const toReadableMessage = (data: unknown, fallback: string): string => {
  if (!data || typeof data !== "object") return fallback;

  const payload = data as Record<string, unknown>;

  if (payload.type === "validation" && Array.isArray(payload.errors)) {
    const parts: string[] = [];

    for (const issue of payload.errors as Array<{ path?: unknown[]; message?: string }>) {
      const fieldKey = Array.isArray(issue.path) && issue.path.length > 0 ? String(issue.path[0]) : "";
      const label = fieldKey && FIELD_LABELS[fieldKey] ? FIELD_LABELS[fieldKey] : fieldKey;
      const detail = issue.message ? translateValidationMessage(issue.message) : "";

      if (label && detail) parts.push(`${label}: ${detail}`);
      else if (detail) parts.push(detail);
    }

    if (parts.length) return parts.join(". ");
  }

  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.error === "string") return payload.error;

  return fallback;
};

class ApiClient {
  async get<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
    return this.request<T>(`${path}${buildQuery(params)}`);
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
      const data = (await response.json().catch(() => undefined)) as unknown;
      throw new ApiRequestError({
        status: response.status,
        message: toReadableMessage(data, `Nao foi possivel concluir a solicitacao (${response.status})`),
        data,
      });
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }
}

export const apiClient = new ApiClient();
