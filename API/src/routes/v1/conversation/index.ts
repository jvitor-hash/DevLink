import Elysia from "elysia";
import { z } from "zod";
import { ErrorSchema } from "@/modules/error_schema";
import { ConversationCreateSchema, ConversationSchema } from "@/database/data-transfer-object/conversation_dto";
import { authPlugin } from "@/modules/auth_plugin";
import { ConversationController } from "@/app/dependencies";

export const ConversationRouter = new Elysia({ prefix: "/api/v1/conversations" })
  .use(authPlugin)
  .get("/", ConversationController.list, {
    query: z.object({ projectId: z.uuid().optional() }).optional(),
    response: { 200: z.array(ConversationSchema), 500: ErrorSchema }, tags: ["Conversations"], auth: true,
  })
  .post("/", ConversationController.create, {
    body: ConversationCreateSchema,
    response: { 201: ConversationSchema, 403: ErrorSchema, 500: ErrorSchema }, tags: ["Conversations"], auth: true,
  })
  .get("/:id", ConversationController.get, {
    params: z.object({ id: z.uuid() }),
    response: { 200: ConversationSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Conversations"], authOptional: true,
  });
