import Elysia from "elysia";
import { ErrorSchema } from "@/modules/error_schema";
import { ProjectCreateSchema, ProjectUpdateSchema, ProjectDTOSchema, type ProjectCreate, type ProjectUpdate } from "@/database/data-transfer-object/project_dto";
import { ProjectService } from "./service";
import { z } from "zod";
import { schemas } from "@/database/schema";
import { and, eq, type SQL } from "drizzle-orm";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";
import { notifyNewProject } from "@/modules/notification_fanout";

export const ProjectsRouter = new Elysia({ prefix: "/api/v1/projects" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as ProjectCreate;
      const newProject = await ProjectService.create({
        ...data,
        clientId: user.id,
      });

      try {
        await notifyNewProject({
          id: newProject.id,
          title: newProject.title,
          minBudget: newProject.minBudget,
          maxBudget: newProject.maxBudget,
          deadline: newProject.deadline ? new Date(newProject.deadline) : null,
          primaryLanguage: newProject.primaryLanguage,
          platforms: newProject.platforms,
        });
      } catch {
        // Notification fan-out must never block project creation.
      }

      set.status = 201;
      return newProject;
    } catch (error) {
      logError("POST /api/v1/projects", error);
      set.status = 500;
      return { error: "Failed to create project" };
    }
  }, {
    body: ProjectCreateSchema,
    response: {
      201: ProjectDTOSchema,
      500: ErrorSchema,
    },
    tags: ["Projects"],
    auth: true,
  })
  .get("/", async ({ query, user, set }) => {
    try {
      const platforms = Array.isArray(query.platforms)
        ? query.platforms
        : query.platforms ? [query.platforms] : undefined;

      const excludeStatuses = Array.isArray(query.excludeStatuses)
        ? query.excludeStatuses
        : query.excludeStatuses ? [query.excludeStatuses] : undefined;

      const filters = {
        audience: query.audience,
        platforms,
        primaryLanguage: query.primaryLanguage,
        status: query.status,
        excludeStatuses,
        minBudget: query.minBudget,
        maxBudget: query.maxBudget,
        q: query.q,
        category: query.category,
        sub_category: query.sub_category,
        clientId: query.clientId,
        savedOnly: query.savedOnly === "true",
      };

      return await ProjectService.findFiltered(user?.id ?? null, filters, query.limit, query.offset);
    } catch (error) {
      logError("GET /api/v1/projects", error);
      set.status = 500;
      return { error: "Failed to fetch projects" };
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
      audience: z.string().optional(),
      platforms: z.union([z.string(), z.array(z.string())]).optional(),
      primaryLanguage: z.string().optional(),
      status: z.string().optional(),
      excludeStatuses: z.union([z.string(), z.array(z.string())]).optional(),
      minBudget: z.coerce.number().optional(),
      maxBudget: z.coerce.number().optional(),
      q: z.string().optional(),
      category: z.string().optional(),
      sub_category: z.string().optional(),
      clientId: z.string().uuid().optional(),
      savedOnly: z.string().optional(),
    }),
    response: {
      200: z.array(ProjectDTOSchema),
      500: ErrorSchema,
    },
    tags: ["Projects"],
    authOptional: true,
  })
  .get("/counts/by-client", async ({ query, set }) => {
    try {
      const counts = await ProjectService.countProjectsByClients(query.clientIds);
      return { counts };
    } catch (error) {
      logError("GET /api/v1/projects/counts/by-client", error);
      set.status = 500;
      return { error: "Failed to fetch project counts" };
    }
  }, {
    query: z.object({
      clientIds: z.string(),
    }),
    response: {
      200: z.object({ counts: z.record(z.string(), z.number()) }),
      500: ErrorSchema,
    },
    tags: ["Projects"],
    authOptional: true,
  })
  .get("/counts/by-category", async ({ query, set }) => {
    try {
      const excludeStatuses = Array.isArray(query.excludeStatuses)
        ? query.excludeStatuses
        : query.excludeStatuses ? [query.excludeStatuses] : undefined;

      const counts = await ProjectService.countByCategory(excludeStatuses);
      return { counts };
    } catch (error) {
      logError("GET /api/v1/projects/counts/by-category", error);
      set.status = 500;
      return { error: "Failed to fetch project category counts" };
    }
  }, {
    query: z.object({
      excludeStatuses: z.union([z.string(), z.array(z.string())]).optional(),
    }),
    response: {
      200: z.object({ counts: z.record(z.string(), z.number()) }),
      500: ErrorSchema,
    },
    tags: ["Projects"],
    authOptional: true,
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const project = await ProjectService.findOne(eq(schemas.project.id, params.id));
      return project;
    } catch (error) {
      logError("GET /api/v1/projects/:id", error);
      set.status = 404;
      return { error: "Project not found" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: ProjectDTOSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Projects"],
    auth: true,
  })
  .put("/:id", async ({ body, params, user, set }) => {
    try {
      const data = body as ProjectUpdate;
      const updated = await ProjectService.update(
        and(eq(schemas.project.id, params.id), eq(schemas.project.clientId, user.id)) as SQL<unknown>,
        data
      );
      return updated;
    } catch (error) {
      logError("PUT /api/v1/projects/:id", error);
      set.status = 404;
      return { error: "Project not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: ProjectUpdateSchema,
    response: {
      200: ProjectDTOSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Projects"],
    auth: true,
  })
  .delete("/:id", async ({ params, user, set }) => {
    try {
      const deleted = await ProjectService.remove(
        and(eq(schemas.project.id, params.id), eq(schemas.project.clientId, user.id)) as SQL<unknown>
      );
      return deleted;
    } catch (error) {
      logError("DELETE /api/v1/projects/:id", error);
      set.status = 404;
      return { error: "Project not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: ProjectDTOSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Projects"],
    auth: true,
  });
