import { executeController, requireRole, requireValue } from "@/shared/http/controller_handler";
import { ForbiddenError, HttpStatus } from "@/shared/errors/domain_errors";

const asArray = (value: string | string[] | undefined): string[] | undefined => Array.isArray(value) ? value : value ? [value] : undefined;

const projectFilters = (query: any) => ({
  audience: query.audience,
  platforms: asArray(query.platforms),
  primaryLanguage: query.primaryLanguage,
  status: query.status,
  excludeStatuses: asArray(query.excludeStatuses),
  minBudget: query.minBudget,
  maxBudget: query.maxBudget,
  q: query.q,
  category: query.category,
  sub_category: query.sub_category,
  clientId: query.clientId,
});

type ProjectService = {
  create: (...args: any[]) => Promise<any>;
  findFiltered: (...args: any[]) => Promise<any>;
  findSavedByUser: (...args: any[]) => Promise<any>;
  countProjectsByClients: (...args: any[]) => Promise<any>;
  countByCategory: (...args: any[]) => Promise<any>;
  findById: (...args: any[]) => Promise<any>;
  recordView: (...args: any[]) => Promise<any>;
  updateOwned: (...args: any[]) => Promise<any>;
  removeOwned: (...args: any[]) => Promise<any>;
};

type SaveProjectService = {
  save: (...args: any[]) => Promise<any>;
  unsave: (...args: any[]) => Promise<any>;
};

export class ProjectControllerClass {
  constructor(private readonly projectService: ProjectService, private readonly saveProjectService: SaveProjectService) {};

  public create({ body, user, set }: any) {
    return executeController(
      set,
      () => this.projectService.create({ ...body, clientId: user.id }),
      "Failed to create project",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public action({ body, user, set }: any) {
    return executeController(
      set,
      async () => {
        requireRole(user.role, "PROGRAMMER", "Only programmers can save projects");
        body.type === "SAVE_PROJECT" ? 
          await this.saveProjectService.save({ userId: user.id, projectId: body.id }) : 
          await this.saveProjectService.unsave({ userId: user.id, projectId: body.id });
        return { success: true };
      },
      "Failed to perform action",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public list({ query, user, set }: any) {
    return executeController(
      set,
      () => this.projectService.findFiltered(user.id ?? null, projectFilters(query), query.limit, query.offset),
      "Failed to fetch projects",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public saved({ query, user, set }: any) {
    return executeController(
      set,
      () => this.projectService.findSavedByUser(user.id, query.limit, query.offset),
      "Failed to fetch saved projects",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public countByClient({ query, set }: any) {
    return executeController(
      set,
      async () => {
        return {counts: await this.projectService.countProjectsByClients(query.clientIds)}
      },
      "Failed to fetch project counts",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public countByCategory({ query, set }: any) {
    return executeController(
      set,
      async () => {
        return { counts: await this.projectService.countByCategory(asArray(query.excludeStatuses))}
      },
      "Failed to fetch project category counts",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public get({ params, user, set }: any) {
    return executeController(
      set,
      async() => {
        const project = await requireValue(await this.projectService.findById(params.id), "Project not found");
        const isParticipant = project.clientId === user?.id || project.programmerId === user?.id;
        
        if (project.status === "IN_DEVELOPMENT" && !isParticipant)
          throw new ForbiddenError("Project is only available to its participants");

        return await this.projectService.recordView(project.id, user.id ?? null)
                .catch(() => { throw new Error("Failed to fetch project record") })
      },
      "Failed to fetch project",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public update({ body, params, user, set }: any) {
    return executeController(
      set,
      () => this.projectService.updateOwned(params.id, user.id, body),
      "Project not found or unauthorized",
      HttpStatus.NOT_FOUND
    );
  }

  public remove({ params, user, set }: any) {
    return executeController(
      set,
      () => this.projectService.removeOwned(params.id, user.id),
      "Project not found or unauthorized",
      HttpStatus.NOT_FOUND
    );
  }
}