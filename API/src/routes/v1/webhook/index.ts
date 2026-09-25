import Elysia from "elysia";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { schemas } from "@/database/schema";
import { db } from "@/client";
import { authPlugin } from "@/modules/auth_plugin";
import { ErrorSchema } from "@/modules/error_schema";
import { logError } from "@/modules/logger";
import { requeueDeadEvents } from "@/modules/notification_outbox";

const WebhookSubscriptionSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  isActive: z.boolean(),
  createdAt: z.union([z.date(), z.string()]),
});

const WebhookSubscriptionCreatedSchema = WebhookSubscriptionSchema.extend({
  // Only shown once, at creation time.
  secret: z.string(),
});

const WebhookEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

export const WebhookRouter = new Elysia({ prefix: "/api/v1/webhooks" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const [existing] = await db
        .select()
        .from(schemas.webhookSubscription)
        .where(and(eq(schemas.webhookSubscription.userId, user.id), eq(schemas.webhookSubscription.url, body.url)))
        .limit(1);

      if (existing) {
        set.status = 409;
        return { error: "A subscription for this URL already exists" };
      }

      const [created] = await db
        .insert(schemas.webhookSubscription)
        .values({
          userId: user.id,
          url: body.url,
          secret: crypto.randomUUID().replace(/-/g, ""),
        })
        .returning();

      set.status = 201;
      return {
        id: created.id,
        url: created.url,
        secret: created.secret,
        isActive: created.isActive,
        createdAt: created.createdAt,
      };
    } catch (error) {
      logError("POST /api/v1/webhooks", error);
      set.status = 500;
      return { error: "Failed to create webhook subscription" };
    }
  }, {
    body: z.object({
      url: z.string().url(),
    }),
    response: {
      201: WebhookSubscriptionCreatedSchema,
      409: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Webhooks"],
    auth: true,
  })
  .get("/", async ({ user, set }) => {
    try {
      const rows = await db
        .select()
        .from(schemas.webhookSubscription)
        .where(eq(schemas.webhookSubscription.userId, user.id));

      return rows.map((row: typeof schemas.webhookSubscription.$inferSelect) => ({
        id: row.id,
        url: row.url,
        isActive: row.isActive,
        createdAt: row.createdAt,
      }));
    } catch (error) {
      logError("GET /api/v1/webhooks", error);
      set.status = 500;
      return { error: "Failed to fetch webhook subscriptions" };
    }
  }, {
    response: {
      200: z.array(WebhookSubscriptionSchema),
      500: ErrorSchema,
    },
    tags: ["Webhooks"],
    auth: true,
  })
  .delete("/:id", async ({ params, user, set }) => {
    try {
      const [deleted] = await db
        .delete(schemas.webhookSubscription)
        .where(and(eq(schemas.webhookSubscription.id, params.id), eq(schemas.webhookSubscription.userId, user.id)))
        .returning();

      if (!deleted) {
        set.status = 404;
        return { error: "Webhook subscription not found" };
      }

      return deleted;
    } catch (error) {
      logError("DELETE /api/v1/webhooks/:id", error);
      set.status = 500;
      return { error: "Failed to delete webhook subscription" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: WebhookSubscriptionSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Webhooks"],
    auth: true,
  })
  .post("/admin/requeue-dead", async ({ set }) => {
    try {
      const requeued = await requeueDeadEvents();
      return { requeued };
    } catch (error) {
      logError("POST /api/v1/webhooks/admin/requeue-dead", error);
      set.status = 500;
      return { error: "Failed to requeue dead outbox events" };
    }
  }, {
    response: {
      200: z.object({ requeued: z.number() }),
      500: ErrorSchema,
    },
    tags: ["Webhooks"],
    auth: true,
  });

export type WebhookEventPayload = z.infer<typeof WebhookEventSchema>;
