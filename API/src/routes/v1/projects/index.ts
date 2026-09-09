import Elysia from "elysia";
import { ErrorSchema } from "@/modules/error_schema";
import { ProjectCreateSchema, ProjectUpdateSchema, ProjectDTOSchema, type ProjectCreate, type ProjectUpdate } from "@/database/data-transfer-object/project_dto";
import { ProjectService } from "./service";
import { z } from "zod";
import { schemas } from "@/database/schema";
import { and, eq, type SQL } from "drizzle-orm";
import { authPlugin } from "@/modules/auth_plugin";

export const ProjectsRouter = new Elysia({ prefix: "/api/v1/projects" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as ProjectCreate;
      const newProject = await ProjectService.create({
        ...data,
        clientId: (user as any).id,
      });
      set.status = 201;
      return newProject;
    } catch (error) {
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
  .get("/", async ({ query, set }) => {
    try {
      return await ProjectService.findAll(query.limit, query.offset);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to fetch projects" };
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(ProjectDTOSchema),
      500: ErrorSchema,
    },
    tags: ["Projects"],
    auth: true,
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const project = await ProjectService.findOne(eq(schemas.project.id, params.id));
      return project;
    } catch (error) {
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
        and(eq(schemas.project.id, params.id), eq(schemas.project.clientId, (user as any).id)) as SQL<unknown>,
        data
      );
      return updated;
    } catch (error) {
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
        and(eq(schemas.project.id, params.id), eq(schemas.project.clientId, (user as any).id)) as SQL<unknown>
      );
      return deleted;
    } catch (error) {
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
