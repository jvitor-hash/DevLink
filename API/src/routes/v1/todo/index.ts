import Elysia from "elysia";
import { z } from "zod";
import { TodoService } from "./service";
import { TodoCreateSchema, TodoUpdateSchema, TodoSchema, type TodoCreate, type TodoUpdate } from "@/database/data-transfer-object/todo_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";

export const TodoRouter = new Elysia({ prefix: "/api/v1/todos" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as TodoCreate;
      const newTodo = await TodoService.createForProject({
        projectId: data.projectId,
        creatorId: user.id,
        title: data.title,
        description: data.description,
      });
      set.status = 201;
      return newTodo;
    } catch (error) {
      logError("POST /api/v1/todos", error);
      set.status = (error as Error).message === "Project not found or unauthorized" ? 403 : 500;
      return { error: (error as Error).message === "Project not found or unauthorized" ? "Not a project participant" : "Failed to create todo" };
    }
  }, {
    body: TodoCreateSchema,
    response: {
      201: TodoSchema,
      403: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Todos"],
    auth: true,
  })
  .get("/", async ({ query, user }) => {
    return await TodoService.findAllByUser(user.id, query.limit, query.offset);
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(TodoSchema),
    },
    tags: ["Todos"],
    auth: true,
  })
  .get("/project/:projectId", async ({ params, user }) => {
    return await TodoService.findAllByProject(params.projectId, user.id);
  }, {
    params: z.object({
      projectId: z.string().uuid(),
    }),
    response: {
      200: z.array(TodoSchema),
    },
    tags: ["Todos"],
    auth: true,
  })
  .get("/counts", async ({ query }) => {
    const counts = await TodoService.countByProjects(query.projectIds);
    return { counts };
  }, {
    query: z.object({
      projectIds: z.string(),
    }),
    response: {
      200: z.any(),
    },
    tags: ["Todos"],
    authOptional: true,
  })
  .put("/:id", async ({ params, body, user, set }) => {
    try {
      const data = body as TodoUpdate;
      const updated = await TodoService.updateForUser(params.id, user.id, data);
      return updated;
    } catch (error) {
      logError("PUT /api/v1/todos/:id", error);
      set.status = 404;
      return { error: "Todo not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: TodoUpdateSchema,
    response: {
      200: TodoSchema,
      404: ErrorSchema,
    },
    tags: ["Todos"],
    auth: true,
  })
  .delete("/:id", async ({ params, user, set }) => {
    try {
      const deleted = await TodoService.removeForUser(params.id, user.id);
      return deleted;
    } catch (error) {
      logError("DELETE /api/v1/todos/:id", error);
      set.status = 404;
      return { error: "Todo not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: TodoSchema,
      404: ErrorSchema,
    },
    tags: ["Todos"],
    auth: true,
  });
