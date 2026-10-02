import Elysia from "elysia";
import { z } from "zod";
import { authPlugin } from "@/modules/auth_plugin";
import { ErrorSchema } from "@/modules/error_schema";
import { logError, logger } from "@/modules/logger";
import { ActionError, handlers } from "./handlers";
import { ProjectActionRateLimiter } from "./rate_limiter";

const BODY_SCHEMA = z.object({
  action: z.enum(["SAVE_PROJECT", "UPDATE_PROJECT", "DELETE_PROJECT"]),
  payload: z.record(z.string(), z.unknown()),
});

const IDEMPOTENCY_KEY_MAX = 200;

export const ProjectActionRouter = new Elysia({ prefix: "/api/v1/project_action" })
  .use(authPlugin)
  .post("/", async ({ body, user, set, request }) => {
    const idempotencyKey = request.headers.get("idempotency-key") ?? undefined;

    if (idempotencyKey && idempotencyKey.length > IDEMPOTENCY_KEY_MAX) {
      set.status = 400;
      return { error: "Idempotency-Key too long" };
    }

    if (!ProjectActionRateLimiter.consume(user.id)) {
      set.status = 429;
      return { error: "Too many actions, slow down" };
    }

    const parsed = BODY_SCHEMA.safeParse(body);

    if (!parsed.success) {
      set.status = 400;
      return { error: "Invalid action payload" };
    }

    const handler = handlers[parsed.data.action];

    if (!handler) {
      set.status = 400;
      return { error: "Unknown action" };
    }

    try {
      const result = await handler({
        userId: user.id,
        payload: parsed.data.payload,
        idempotencyKey,
      });

      logger.info("[project_action]", parsed.data.action, "actionId:", result.actionId, "eventId:", result.eventId);

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
        actionId: z.string().uuid(),
        eventId: z.string().uuid(),
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

export type ProjectActionBody = z.infer<typeof BODY_SCHEMA>;
