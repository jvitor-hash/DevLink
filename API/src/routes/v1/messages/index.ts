import Elysia from "elysia";
import { z } from "zod";
import { ErrorSchema } from "@/modules/error_schema";
import { MessageCreateSchema, MessageUpdateSchema, MessageSchema } from "@/database/data-transfer-object/message_dto";
import { authPlugin } from "@/modules/auth_plugin";
import { MessageController } from "@/app/dependencies";

const pagination = z.object({ limit: z.coerce.number().min(1).max(100).default(10), offset: z.coerce.number().min(0).default(0) });
const id = z.object({ id: z.uuid() });

export const MessageRouter = new Elysia({ prefix: "/api/v1/messages" })
  .use(authPlugin)
  .post("/", MessageController.create, { body: MessageCreateSchema, response: { 201: MessageSchema, 403: ErrorSchema, 500: ErrorSchema }, tags: ["Messages"], auth: true })
  .get("/", MessageController.list, { query: pagination.extend({ conversationId: z.string().uuid().optional() }), response: { 200: z.array(MessageSchema), 500: ErrorSchema }, tags: ["Messages"], auth: true })
  .get("/:id", MessageController.get, { params: id, response: { 200: MessageSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Messages"], authOptional: true })
  .put("/:id", MessageController.update, { params: id, body: MessageUpdateSchema, response: { 200: MessageSchema, 403: ErrorSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Messages"], auth: true })
  .delete("/:id", MessageController.remove, { params: id, response: { 200: MessageSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Messages"], auth: true });
