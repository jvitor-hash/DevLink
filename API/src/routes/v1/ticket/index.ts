import Elysia from "elysia";
import { z } from "zod";
import { TicketService } from "./service";
import { TicketCreateSchema, TicketUpdateSchema, TicketSchema, type TicketCreate, type TicketUpdate } from "@/database/data-transfer-object/ticket_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";

export const TicketRouter = new Elysia({ prefix: "/api/v1/tickets" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as TicketCreate;
      const newTicket = await TicketService.createForProject({
        projectId: data.projectId,
        creatorId: user.id,
        title: data.title,
        description: data.description,
        status: data.status,
        assigneeId: data.assigneeId,
      });
      set.status = 201;
      return newTicket;
    } catch (error) {
      logError("POST /api/v1/tickets", error);
      set.status = (error as Error).message === "Project not found or unauthorized" ? 403 : 500;
      return { error: (error as Error).message === "Project not found or unauthorized" ? "Not a project participant" : "Failed to create ticket" };
    }
  }, {
    body: TicketCreateSchema,
    response: {
      201: TicketSchema,
      403: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Tickets"],
    auth: true,
  })
  .get("/", async ({ query, user }) => {
    return await TicketService.findAllByUser(user.id, query.limit, query.offset);
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(TicketSchema),
    },
    tags: ["Tickets"],
    auth: true,
  })
  .get("/project/:projectId", async ({ params, user }) => {
    return await TicketService.findAllByProject(params.projectId, user.id);
  }, {
    params: z.object({
      projectId: z.string().uuid(),
    }),
    response: {
      200: z.array(TicketSchema),
    },
    tags: ["Tickets"],
    auth: true,
  })
  .get("/counts", async ({ query }) => {
    const counts = await TicketService.countByProjects(query.projectIds);
    return { counts };
  }, {
    query: z.object({
      projectIds: z.string(),
    }),
    response: {
      200: z.any(),
    },
    tags: ["Tickets"],
    authOptional: true,
  })
  .put("/:id", async ({ params, body, user, set }) => {
    try {
      const data = body as TicketUpdate;
      const updated = await TicketService.updateForUser(params.id, user.id, data);
      return updated;
    } catch (error) {
      logError("PUT /api/v1/tickets/:id", error);
      set.status = 404;
      return { error: "Ticket not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: TicketUpdateSchema,
    response: {
      200: TicketSchema,
      404: ErrorSchema,
    },
    tags: ["Tickets"],
    auth: true,
  })
  .delete("/:id", async ({ params, user, set }) => {
    try {
      const deleted = await TicketService.removeForUser(params.id, user.id);
      return deleted;
    } catch (error) {
      logError("DELETE /api/v1/tickets/:id", error);
      set.status = 404;
      return { error: "Ticket not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: TicketSchema,
      404: ErrorSchema,
    },
    tags: ["Tickets"],
    auth: true,
  });
