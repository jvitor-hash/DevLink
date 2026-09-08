import Elysia from "elysia";
import { SavedTicketCreateSchema, SavedTicketSchema } from "@/database/data-transfer-object/saved_ticket";
import { SavedTicketService } from "./service";
import { ErrorSchema } from "@/modules/error_schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { schemas } from "@/database/schema";

export const SavedTicketRouter = new Elysia({ prefix: "/api/v1/saved_ticket" })
  .post("/", async ({ body, set }) => {
    try {
      return await SavedTicketService.create(body);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create saved ticket" };
    }
  }, {
    body: SavedTicketCreateSchema,
    response: {
      201: SavedTicketSchema,
      500: ErrorSchema
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
    };
  }, {
    query: z.object({
      limit: z.coerce.number().min(10).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(SavedTicketSchema),
      500: ErrorSchema,
    },
    tags: ["Saved Tickets"],
    auth: true,
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const [ticket] = await SavedTicketService.findWhere(eq(schemas.savedTicket.id, params.id));
      return ticket;
    } catch (error) {
      set.status = 404;
      return { error: "Saved ticket not found" };
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: SavedTicketSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Saved Tickets"],
    auth: true
  })
  .delete("/:id", async ({ params, set }) => {
    try {
      const [deleted] = await SavedTicketService.remove(eq(schemas.savedTicket.id, params.id));
      return deleted;
    } catch (error) {
      set.status = 404;
      return { error: "Saved ticket not found" };
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: SavedTicketSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Saved Tickets"],
    auth: true
  });
