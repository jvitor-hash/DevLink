import type { ListParams, ProjectActionAccepted, ProjectActionType, ProjectCreate, ProjectDTO, ProjectEvent, ProjectUpdate } from "@/data/types/database";
import { apiClient } from "@/utils/api_client";
import { projectActionsEnabled } from "@/utils/feature_flags";
import { mockProjectAction, mockProjectEventBus } from "@/utils/mock_project_events";

const endpoints = ["/api/v1/projects"];

export const projectService = {
  create: (data: ProjectCreate) => apiClient.post<ProjectDTO>(endpoints[0], data),
  list: (params?: ListParams) => apiClient.get<ProjectDTO[]>(endpoints[0], params),
  getById: (id: string) => apiClient.get<ProjectDTO>(`${endpoints[0]}/${id}`),
  update: (id: string, data: ProjectUpdate) => apiClient.put<ProjectDTO>(`${endpoints[0]}/${id}`, data),
  remove: (id: string) => apiClient.delete<ProjectDTO>(`${endpoints[0]}/${id}`),
  countByClients: (clientIds: string[]) =>
    apiClient.get<{ counts: Record<string, number> }>(`${endpoints[0]}/counts/by-client`, {
      clientIds: clientIds.join(","),
    }),

  /** Open project counts grouped by category. */
  countByCategory: (excludeStatuses?: string[]) =>
    apiClient.get<{ counts: Record<string, number> }>(`${endpoints[0]}/counts/by-category`, {
      excludeStatuses,
    }),
};

const MOCK_EVENT_BY_ACTION: Record<ProjectActionType, ProjectEvent["type"]> = {
  SAVE_PROJECT: "project.saved",
  UPDATE_PROJECT: "project.updated",
  DELETE_PROJECT: "project.deleted",
};

// Event-driven project actions; the API replies 202 with an outbox event id.
// With the feature flag off, everything resolves locally against mocks and
// a matching mock event is emitted so the UI reacts without a backend.
export const projectActions = {
  send: async (action: ProjectActionType, payload: Record<string, unknown>, idempotencyKey?: string): Promise<ProjectActionAccepted> => {
    if (!projectActionsEnabled()) {
      const receipt = mockProjectAction(action, payload);
      const projectId = typeof payload.projectId === "string" ? payload.projectId : crypto.randomUUID();

      mockProjectEventBus.emit({
        type: MOCK_EVENT_BY_ACTION[action],
        projectId,
        payload: { mocked: true },
      });

      return receipt;
    }

    return apiClient.post<ProjectActionAccepted>(
      "/api/v1/project_action",
      { action, payload },
      { "Idempotency-Key": idempotencyKey ?? crypto.randomUUID() },
    );
  },

  saveProject: (payload: ProjectCreate) => projectActions.send("SAVE_PROJECT", payload as unknown as Record<string, unknown>),

  updateProject: (projectId: string, payload: ProjectUpdate) =>
    projectActions.send("UPDATE_PROJECT", { projectId, ...payload } as unknown as Record<string, unknown>),

  deleteProject: (projectId: string) => projectActions.send("DELETE_PROJECT", { projectId }),
}