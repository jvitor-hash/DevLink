import Elysia from "elysia";
import { z } from "zod";
import { authPlugin } from "@/modules/auth_plugin";
import { ErrorSchema } from "@/modules/error_schema";
import { ProjectCreateSchema, ProjectDTOSchema, ProjectUpdateSchema } from "@/database/data-transfer-object/project_dto";
import { ProjectController } from "@/app/dependencies";
import { routeHandler } from "@/shared/http/route_handler";

const pagination = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

const listQuery = pagination.extend({
  audience: z.string().optional(), platforms: z.union([z.string(), z.array(z.string())]).optional(),
  primaryLanguage: z.string().optional(), status: z.string().optional(),
  excludeStatuses: z.union([z.string(), z.array(z.string())]).optional(),
  minBudget: z.coerce.number().optional(), maxBudget: z.coerce.number().optional(),
  q: z.string().optional(), category: z.string().optional(), sub_category: z.string().optional(),
  clientId: z.uuid().optional(),
});

const idParams = z.object({ id: z.uuid() });
export const ProjectsRouter = new Elysia({ prefix: "/api/v1/projects" })
  .use(authPlugin)
  .post("/", routeHandler(ProjectController.create), {
    body: ProjectCreateSchema,
    response: { 201: ProjectDTOSchema, 500: ErrorSchema }, tags: ["Projects"], auth: true,
  })
  .post("/actions", routeHandler(ProjectController.action), {
    body: z.object({ type: z.enum(["SAVE_PROJECT", "UNSAVE_PROJECT"]), payload: z.object({ projectId: z.string().uuid() }) }),
    response: { 200: z.object({ success: z.boolean() }), 403: ErrorSchema, 500: ErrorSchema }, tags: ["Projects"], auth: true,
  })
  .get("/saved", routeHandler(ProjectController.saved), {
    query: pagination.extend({ limit: z.coerce.number().min(1).max(100).default(20) }),
    response: { 200: z.array(ProjectDTOSchema), 500: ErrorSchema }, tags: ["Projects"], auth: true,
  })
  .get("/counts/by-client", routeHandler(ProjectController.countByClient), {
    query: z.object({ clientIds: z.string() }),
    response: { 200: z.object({ counts: z.record(z.string(), z.number()) }), 500: ErrorSchema }, tags: ["Projects"], authOptional: true,
  })
  .get("/counts/by-category", routeHandler(ProjectController.countByCategory), {
    query: z.object({ excludeStatuses: z.union([z.string(), z.array(z.string())]).optional() }),
    response: { 200: z.object({ counts: z.record(z.string(), z.number()) }), 500: ErrorSchema }, tags: ["Projects"], authOptional: true,
  })
  .get("/", routeHandler(ProjectController.list), {
    query: listQuery,
    response: { 200: z.array(ProjectDTOSchema), 500: ErrorSchema }, tags: ["Projects"], authOptional: true,
  })
  .get("/:id", routeHandler(ProjectController.get), {
    params: idParams,
    response: { 200: ProjectDTOSchema, 403: ErrorSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Projects"], authOptional: true,
  })
  .put("/:id", routeHandler(ProjectController.update), {
    params: idParams, body: ProjectUpdateSchema,
    response: { 200: ProjectDTOSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Projects"], auth: true,
  })
  .delete("/:id", routeHandler(ProjectController.remove), {
    params: idParams,
    response: { 200: ProjectDTOSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Projects"], auth: true,
  });
