import type { ProjectCreate, ProjectUpdate } from "@/database/data-transfer-object/project_dto";
import type { ProjectFilters, ProjectPort } from "./ports";

export class ProjectApplicationService {
  constructor(private readonly projects: ProjectPort) {}

  create(data: ProjectCreate & { clientId: string }) { return this.projects.create(data); }
  findById(id: string) { return this.projects.findById(id); }
  findFiltered(userId: string | null, filters: ProjectFilters, limit: number, offset: number) { return this.projects.findFiltered(userId, filters, limit, offset); }
  findSavedByUser(userId: string, limit: number, offset: number) { return this.projects.findSavedByUser(userId, limit, offset); }
  countProjectsByClients(ids: string) { return this.projects.countProjectsByClients(ids); }
  countByCategory(statuses?: string[]) { return this.projects.countByCategory(statuses); }
  updateOwned(id: string, clientId: string, data: ProjectUpdate) { return this.projects.updateOwned(id, clientId, data); }
  removeOwned(id: string, clientId: string) { return this.projects.removeOwned(id, clientId); }
  recordView(id: string, viewerId: string | null) { return this.projects.recordView(id, viewerId); }
}
