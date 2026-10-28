import Elysia from "elysia";
import { z } from "zod";
import { TodoController as controller } from "@/app/dependencies";
import { TodoCreateSchema, TodoUpdateSchema, TodoSchema } from "@/database/data-transfer-object/todo_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";

const pagination = z.object({ limit: z.coerce.number().min(1).max(100).default(10), offset: z.coerce.number().min(0).default(0) });
const id = z.object({ id: z.string().uuid() });

export const TodoRouter = new Elysia({ prefix: "/api/v1/todos" })
  .use(authPlugin)
  .post("/", controller.create, { body: TodoCreateSchema, response: { 201: TodoSchema, 403: ErrorSchema, 500: ErrorSchema }, tags: ["Todos"], auth: true })
  .get("/", controller.list, { query: pagination, response: { 200: z.array(TodoSchema), 500: ErrorSchema }, tags: ["Todos"], auth: true })
  .get("/project/:projectId", controller.listByProject, { params: z.object({ projectId: z.string().uuid() }), response: { 200: z.array(TodoSchema), 500: ErrorSchema }, tags: ["Todos"], auth: true })
  .get("/counts", controller.counts, { query: z.object({ projectIds: z.string() }), response: { 200: z.object({ counts: z.record(z.string(), z.object({ total: z.number(), done: z.number() })) }), 500: ErrorSchema }, tags: ["Todos"], authOptional: true })
  .put("/:id", controller.update, { params: id, body: TodoUpdateSchema, response: { 200: TodoSchema, 404: ErrorSchema }, tags: ["Todos"], auth: true })
  .delete("/:id", controller.remove, { params: id, response: { 200: TodoSchema, 404: ErrorSchema }, tags: ["Todos"], auth: true });
