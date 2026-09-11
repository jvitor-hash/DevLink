import Elysia from "elysia";
import { SavedTicketCreateSchema, SavedTicketSchema, type SavedTicketCreate } from "@/database/data-transfer-object/saved_ticket";
import { SavedTicketService } from "./service";
import { ErrorSchema } from "@/modules/error_schema";
import { z } from "zod";
import { and, eq, type SQL } from "drizzle-orm";
import { schemas } from "@/database/schema";
import { authPlugin } from "@/modules/auth_plugin";

export const SavedTicketRouter = new Elysia({ prefix: "/api/v1/saved-tickets" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as SavedTicketCreate;
      const newSavedTicket = await SavedTicketService.create({
        ...data,
        userId: (user as any).id,
      });
      set.status = 201;
      return newSavedTicket;
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create saved ticket" };
    }
  }, {
    body: SavedTicketCreateSchema,
    response: {
      201: SavedTicketSchema,
      500: ErrorSchema,
    },
    tags: ["Saved Tickets"],
    auth: true,
  })
  .get("/", async ({ query, set }) => {
    try {
      return await SavedTicketService.findAll(query.limit, query.offset);
    } catch (error) {
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
  .get("/:id", async ({ params, set }) => {
    try {
      const ticket = await SavedTicketService.findOne(eq(schemas.savedTicket.id, params.id));
      return ticket;
    } catch (error) {
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
    try {
      const deleted = await SavedTicketService.remove(
        and(eq(schemas.savedTicket.id, params.id), eq(schemas.savedTicket.userId, (user as any).id)) as SQL<unknown>
      );
      return deleted;
    } catch (error) {
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
