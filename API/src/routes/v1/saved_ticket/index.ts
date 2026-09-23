import Elysia from "elysia";
import { SavedTicketCreateSchema, SavedTicketSchema, type SavedTicketCreate } from "@/database/data-transfer-object/saved_ticket";
import { SavedTicketService } from "./service";
import { ErrorSchema } from "@/modules/error_schema";
import { z } from "zod";
import { and, eq, type SQL } from "drizzle-orm";
import { schemas } from "@/database/schema";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";

export const SavedTicketRouter = new Elysia({ prefix: "/api/v1/saved-tickets" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    if (user.role !== "PROGRAMMER") {
      set.status = 403;
      return { error: "Only programmers can save projects" };
    }

    try {
      const data = body as SavedTicketCreate;
      const newSavedTicket = await SavedTicketService.createForUser({
        ...data,
        userId: user.id,
      });
      set.status = 201;
      return newSavedTicket;
    } catch (error) {
      logError("POST /api/v1/saved-tickets", error);

      if (error instanceof Error && error.message === "Concluded projects cannot be saved") {
        set.status = 409;
        return { error: "Concluded projects cannot be saved" };
      }

      set.status = 404;
      return { error: "Failed to create saved ticket" };
    }
  }, {
    body: SavedTicketCreateSchema,
    response: {
      201: SavedTicketSchema,
      404: ErrorSchema,
      409: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Saved Tickets"],
    auth: true,
  })
  .get("/", async ({ query, user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      return await SavedTicketService.findAllByUser(user.id, query.limit, query.offset);
    } catch (error) {
      logError("GET /api/v1/saved-tickets", error);
      set.status = 500;
      return { error: "Failed to fetch saved tickets" };
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(SavedTicketSchema),
      500: ErrorSchema,
    },
    tags: ["Saved Tickets"],
    auth: true,
  })
  .get("/by-user/:userId", async ({ params, set }) => {
    try {
      const ids = await SavedTicketService.findSavedProjectIdsByUser(params.userId);
      return { savedProjectIds: ids };
    } catch (error) {
      logError("GET /api/v1/saved-tickets/by-user/:userId", error);
      set.status = 500;
      return { error: "Failed to fetch saved tickets" };
    }
  }, {
    params: z.object({
      userId: z.string().uuid(),
    }),
    response: {
      200: z.object({ savedProjectIds: z.array(z.string().uuid()) }),
      500: ErrorSchema,
    },
    tags: ["Saved Tickets"],
    auth: true,
  })
  .get("/counts", async ({ query, set }) => {
    try {
      const counts = await SavedTicketService.countByProjects(query.projectIds);
      return { counts };
    } catch (error) {
      logError("GET /api/v1/saved-tickets/counts", error);
      set.status = 500;
      return { error: "Failed to fetch save counts" };
    }
  }, {
    query: z.object({
      projectIds: z.string(),
    }),
    response: {
      200: z.object({ counts: z.record(z.string(), z.number()) }),
      500: ErrorSchema,
    },
    tags: ["Saved Tickets"],
    authOptional: true,
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const ticket = await SavedTicketService.findOne(eq(schemas.savedTicket.id, params.id));
      return ticket;
    } catch (error) {
      logError("GET /api/v1/saved-tickets/:id", error);
      set.status = 404;
      return { error: "Saved ticket not found" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: SavedTicketSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Saved Tickets"],
    auth: true,
  })
  .delete("/:id", async ({ params, user, set }) => {
    if (user.role !== "PROGRAMMER") {
      set.status = 403;
      return { error: "Only programmers can save projects" };
    }

    try {
      const deleted = await SavedTicketService.removeForUser(params.id, user.id);
      return deleted;
    } catch (error) {
      logError("DELETE /api/v1/saved-tickets/:id", error);
      set.status = 404;
      return { error: "Saved ticket not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: SavedTicketSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Saved Tickets"],
    auth: true,
  });
