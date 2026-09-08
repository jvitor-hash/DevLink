import Elysia from "elysia";
import { ErrorSchema } from '@/modules/error_schema';
import { ProjectCreateSchema, ProjectUpdateSchema, ProjectDTOSchema } from "@/database/data-transfer-object/project_dto";
import { ProjectService } from "./service";
import { z } from 'zod';
import { schemas } from "@/database/schema";
import { eq } from "drizzle-orm";

export const ProjectsRouter = new Elysia({ prefix: "/api/v1/projects" })
  .post("/", async ({ body, set }) => {
    try {
      return await ProjectService.create(body);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create project" };
    }
  }, {
    body: ProjectCreateSchema,
    response: {
      201: ProjectDTOSchema,
      500: ErrorSchema
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
    };
  }, {
    query: z.object({
      limit: z.coerce.number().min(10).max(100).default(10),
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
      const [project] = await ProjectService.findWhere(eq(schemas.project.id, params.id));
      return project;
    } catch (error) {
      set.status = 404;
      return { error: "Project not found" };
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: ProjectDTOSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Projects"],
    auth: true
  })
  .put("/:id", async ({ body, params, set }) => {
    try {
      const [updated] = await ProjectService.update(eq(schemas.project.id, params.id), body);
      return updated;
    } catch (error) {
      set.status = 404;
      return { error: "Project not found" };
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    body: ProjectUpdateSchema,
    response: {
      200: ProjectDTOSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Projects"],
    auth: true
  })
  .delete("/:id", async ({ params, set }) => {
    try {
      const [deleted] = await ProjectService.remove(eq(schemas.project.id, params.id));
      return deleted;
    } catch (error) {
      set.status = 404;
      return { error: "Project not found" };
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: ProjectDTOSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Projects"],
    auth: true
  })
