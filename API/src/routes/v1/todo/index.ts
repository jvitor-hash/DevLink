import Elysia from "elysia";
import { z } from "zod";
import { WorkItemController } from "@/app/dependencies";
import { TodoCreateSchema, TodoUpdateSchema, TodoSchema } from "@/database/data-transfer-object/todo_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";

export const TodoRouter = new Elysia({ prefix: "/api/v1/todos" })
  .use(authPlugin)
  .post("/", WorkItemController.create, {
    body: TodoCreateSchema,
    response: { 201: TodoSchema, 403: ErrorSchema, 500: ErrorSchema }, tags: ["Todos"], auth: true
  })
  .get("/", WorkItemController.list, {
    query: z.object({ limit: z.coerce.number().min(1).max(100).default(10), offset: z.coerce.number().min(0).default(0) }),
    body: z.object({ type: z.string().min(1) }),
    response: { 200: z.array(TodoSchema), 500: ErrorSchema }, tags: ["Todos"], auth: true
  })
  .get("/project/:projectId", WorkItemController.listByProject, {
    params: z.object({ projectId: z.uuid() }),
    body: z.object({ type: z.string().min(1) }),
    response: { 200: z.array(TodoSchema), 500: ErrorSchema }, tags: ["Todos"], auth: true
  })
  .get("/counts", WorkItemController.counts, {
    query: z.object({ projectIds: z.string() }),
    body: z.object({ type: z.string().min(1) }),
    response: { 200: z.object({ counts: z.record(z.string(), z.object({ total: z.number(), done: z.number() })) }), 500: ErrorSchema },
    tags: ["Todos"], authOptional: true
  })
  .put("/:id", WorkItemController.update, {
    params: z.object({ id: z.uuid() }),
    body: TodoUpdateSchema,
    response: { 200: TodoSchema, 404: ErrorSchema }, tags: ["Todos"], auth: true
  })
  .delete("/:id", WorkItemController.remove, {
    params: z.object({ id: z.uuid() }),
    response: { 200: TodoSchema, 404: ErrorSchema }, tags: ["Todos"], auth: true
  });
