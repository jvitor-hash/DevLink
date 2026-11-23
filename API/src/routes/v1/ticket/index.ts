import Elysia from "elysia";
import { z } from "zod";
import { WorkItemController } from "@/app/dependencies";
import { TicketCreateSchema, TicketUpdateSchema, TicketSchema } from "@/database/data-transfer-object/ticket_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";

export const TicketRouter = new Elysia({ prefix: "/api/v1/tickets" })
  .use(authPlugin)
  .post("/", (ctx) => {
    ctx.body = { ...(ctx.body as object), type: "TICKET" };
    return WorkItemController.create(ctx);
  }, { 
    body: TicketCreateSchema,
    response: { 201: TicketSchema, 403: ErrorSchema, 500: ErrorSchema }, tags: ["Tickets"], auth: true 
  })
  .get("/", (ctx) => {
    ctx.body = { type: "TICKET" };
    return WorkItemController.list(ctx);
  }, { 
    query: z.object({ limit: z.coerce.number().min(1).max(100).default(10), offset: z.coerce.number().min(0).default(0) }), 
    response: { 200: z.array(TicketSchema), 500: ErrorSchema }, tags: ["Tickets"], auth: true 
  })
  .get("/project/:projectId", (ctx) => {
    ctx.body = { type: "TICKET" };
    return WorkItemController.listByProject(ctx);
  }, { 
    params: z.object({ projectId: z.uuid() }), 
    response: { 200: z.array(TicketSchema), 500: ErrorSchema }, tags: ["Tickets"], auth: true 
  })
  .get("/counts", (ctx) => {
    ctx.body = { type: "TICKET" };
    return WorkItemController.counts(ctx);
  }, { 
    query: z.object({ projectIds: z.string() }),
    response: { 200: z.object({ counts: z.record(z.string(), z.record(z.string(), z.number())) }), 500: ErrorSchema }, 
    tags: ["Tickets"], authOptional: true 
  })
  .put("/:id", (ctx) => {
    ctx.body = { ...(ctx.body as object), type: "TICKET" };
    return WorkItemController.update(ctx);
  }, { 
    params: z.object({ id: z.uuid() }),
    body: TicketUpdateSchema, 
    response: { 200: TicketSchema, 404: ErrorSchema }, tags: ["Tickets"], auth: true 
  })
  .delete("/:id", (ctx) => {
    ctx.body = { type: "TICKET" };
    return WorkItemController.remove(ctx);
  }, { 
    params: z.object({ id: z.uuid() }), 
    response: { 200: TicketSchema, 404: ErrorSchema }, tags: ["Tickets"], auth: true 
  });
