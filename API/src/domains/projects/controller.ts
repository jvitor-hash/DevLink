import { z } from "zod";
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

const projectId = (params: { id: string }): string => z.uuid().parse(params.id);

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

export const createProjectController = (ProjectService: ProjectService, saveProjectService: SaveProjectService) => ({
  create: ({ body, user, set }: any) => executeController(set, async () => {
    const project = await ProjectService.create({ ...body, clientId: user.id });
    set.status = HttpStatus.CREATED;
    return project;
  }, "Failed to create project", HttpStatus.INTERNAL_SERVER_ERROR),

  action: ({ body, user, set }: any) => executeController(set, async () => {
    requireRole(user.role, "PROGRAMMER", "Only programmers can save projects");
    const handler = body.type === "SAVE_PROJECT" ? saveProjectService.save.bind(saveProjectService) : saveProjectService.unsave.bind(saveProjectService);
    await handler({ userId: user.id, projectId: body.payload.projectId });
    return { success: true };
  }, "Failed to perform action", HttpStatus.INTERNAL_SERVER_ERROR),

  list: ({ query, user, set }: any) => executeController(set, () => ProjectService.findFiltered(user?.id ?? null, projectFilters(query), query.limit, query.offset), "Failed to fetch projects", HttpStatus.INTERNAL_SERVER_ERROR),
  saved: ({ query, user, set }: any) => executeController(set, () => ProjectService.findSavedByUser(user.id, query.limit, query.offset), "Failed to fetch saved projects", HttpStatus.INTERNAL_SERVER_ERROR),
  countByClient: ({ query, set }: any) => executeController(set, async () => ({ counts: await ProjectService.countProjectsByClients(query.clientIds) }), "Failed to fetch project counts", HttpStatus.INTERNAL_SERVER_ERROR),
  countByCategory: ({ query, set }: any) => executeController(set, async () => ({ counts: await ProjectService.countByCategory(asArray(query.excludeStatuses)) }), "Failed to fetch project category counts", HttpStatus.INTERNAL_SERVER_ERROR),

  get: ({ params, user, set }: any) => executeController(set, async () => {
    const project = await requireValue(await ProjectService.findById(projectId(params)), "Project not found");
    const isParticipant = project.clientId === user?.id || project.programmerId === user?.id;
    if (project.status === "IN_DEVELOPMENT" && !isParticipant) {
      throw new ForbiddenError("Project is only available to its participants");
    }
    await ProjectService.recordView(project.id, user?.id ?? null).catch(() => undefined);
    return project;
  }, "Failed to fetch project", HttpStatus.INTERNAL_SERVER_ERROR),

  update: ({ body, params, user, set }: any) => executeController(set, () => ProjectService.updateOwned(projectId(params), user.id, body), "Project not found or unauthorized", HttpStatus.NOT_FOUND),
  remove: ({ params, user, set }: any) => executeController(set, () => ProjectService.removeOwned(projectId(params), user.id), "Project not found or unauthorized", HttpStatus.NOT_FOUND),
});
