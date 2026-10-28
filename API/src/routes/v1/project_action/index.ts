import Elysia from "elysia";
import { z } from "zod";
import { authPlugin } from "@/modules/auth_plugin";
import { ErrorSchema } from "@/modules/error_schema";
import { logError, logger } from "@/modules/logger";
import { ActionError, deleteProjectHandler, saveProjectHandler, updateProjectHandler } from "./handlers";

const IDEMPOTENCY_KEY_MAX = 200;

const handlers: Record<string, CallableFunction> = {
  "project.save_project": saveProjectHandler,
  "project.update_project": updateProjectHandler,
  "project.delete_project": deleteProjectHandler,
}

export const ProjectActionRouter = new Elysia({ prefix: "/api/v1/project_action" })
  .use(authPlugin)
  .post("/", async ({ body, user, set, request }) => {
    const idempotencyKey = request.headers.get("idempotency-key") ?? undefined;

    if (idempotencyKey && idempotencyKey.length > IDEMPOTENCY_KEY_MAX) {
      set.status = 400;
      return { error: "Idempotency-Key too long" };
    }

    const handler = handlers[body.action];

    if (!handler) {
      set.status = 400;
      return { error: "Unknown action" };
    }

    try {
      const result = await handler({
        userId: user.id,
        payload: body.payload,
        idempotencyKey,
      });

      logger.info("[project_action] - ", body.action, "eventId:", result.eventId);

      set.status = 202;
      return result;
    } catch (error) {
      if (error instanceof ActionError) {
        set.status = error.status;
        return { error: error.message };
      }

      if (error instanceof z.ZodError) {
        set.status = 400;
        return { error: "Invalid action payload" };
      }

      logError("POST /api/v1/project_action", error);
      set.status = 500;
      return { error: "Failed to process action" };
    }
  }, {
    body: z.object({
      action: z.string(),
      payload: z.record(z.string(), z.unknown()),
    }),
    response: {
      202: z.object({
        actionId: z.uuid(),
        eventId: z.uuid(),
        status: z.literal("PENDING"),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
      403: ErrorSchema,
      404: ErrorSchema,
      429: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Project Actions"],
    auth: true,
  });
