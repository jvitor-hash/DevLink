import type { ProjectCreate, ProjectUpdate } from "@/database/data-transfer-object/project_dto";
import type { schemas } from "@/database/schema";

export type ProjectRecord = typeof schemas.project.$inferSelect;
export type ProjectFilters = {
  audience?: string; platforms?: string[]; primaryLanguage?: string; status?: string;
  excludeStatuses?: string[]; minBudget?: number; maxBudget?: number; q?: string;
  category?: string; sub_category?: string; clientId?: string;
};

export interface ProjectPort {
  create(data: ProjectCreate & { clientId: string }): Promise<ProjectRecord>;
  findById(id: string): Promise<ProjectRecord | undefined>;
  findFiltered(userId: string | null, filters: ProjectFilters, limit: number, offset: number): Promise<ProjectRecord[]>;
  findSavedByUser(userId: string, limit: number, offset: number): Promise<ProjectRecord[]>;
  countProjectsByClients(clientIds: string): Promise<Record<string, number>>;
  countByCategory(excludeStatuses?: string[]): Promise<Record<string, number>>;
  updateOwned(id: string, clientId: string, data: ProjectUpdate): Promise<ProjectRecord>;
  removeOwned(id: string, clientId: string): Promise<ProjectRecord>;
  recordView(projectId: string, viewerId: string | null): Promise<void>;
}
