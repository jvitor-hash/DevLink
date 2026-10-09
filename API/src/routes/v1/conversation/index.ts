import Elysia from "elysia";
import { ErrorSchema } from "@/modules/error_schema";
import { ConversationCreateSchema, ConversationSchema, type ConversationCreate } from "@/database/data-transfer-object/conversation_dto";
import { ConversationService } from "./service";
import { z } from "zod";
import { schemas } from "@/database/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/client";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";

export const ConversationRouter = new Elysia({ prefix: "/api/v1/conversations" })
  .use(authPlugin)
  .get("/", async ({ query, user, set }) => {
    try {
      const projectId = (query as any)?.projectId;
      if (user.role === "CLIENT") {
        const projects = await db.select({ id: schemas.project.id }).from(schemas.project).where(eq(schemas.project.clientId, user.id));
        const projectIds = projects.map((p: any) => p.id);
        const filteredIds = projectId ? projectIds.filter((id: string) => id === projectId) : projectIds;
        const conversations = filteredIds.length
          ? await db.select().from(schemas.conversation).where(inArray(schemas.conversation.projectId, filteredIds))
          : [];
        return conversations;
      }
      if (user.role === "PROGRAMMER") {
        let result = await db.select().from(schemas.conversation).where(sql`${schemas.conversation.userId} = ${user.id} OR ${schemas.conversation.recipientId} = ${user.id}`);
        if (projectId) {
          result = result.filter((c: any) => c.projectId === projectId);
        }
        return result;
      }
      return await ConversationService.findAll();
    } catch (error) {
      logError("GET /api/v1/conversations", error);
      set.status = 500;
      return { error: "Failed to fetch conversations" };
    }
  }, {
    query: z.object({
      projectId: z.string().uuid().optional(),
    }).optional(),
    response: {
      200: z.array(ConversationSchema),
      500: ErrorSchema,
    },
    tags: ["Conversations"],
    auth: true,
  })
  .post("/", async ({ body, user, set }) => {
    try {
      if (user.role !== "PROGRAMMER") {
        set.status = 403;
        return { error: "Only programmers can create conversations" };
      }
      const data = body as ConversationCreate;
      const result = await ConversationService.create({ ...data, userId: user.id });
      set.status = 201;
      return result;
    } catch (error) {
      logError("POST /api/v1/conversations", error);
      set.status = 500;
      return { error: "Failed to create conversation" };
    }
  }, {
    body: ConversationCreateSchema,
    response: { 201: ConversationSchema, 500: ErrorSchema },
    tags: ["Conversations"],
    auth: true,
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const result = await ConversationService.findOne(eq(schemas.conversation.id, params.id));
      if (!result) {
        set.status = 404;
        return { error: "Conversation not found" };
      }
      return result;
    } catch (error) {
      logError("GET /api/v1/conversations/:id", error);
      set.status = 500;
      return { error: "Failed to fetch conversation" };
    }
  }, {
    params: z.object({ id: z.uuid() }),
    response: { 200: ConversationSchema, 404: ErrorSchema, 500: ErrorSchema },
    tags: ["Conversations"],
    authOptional: true,
  });
