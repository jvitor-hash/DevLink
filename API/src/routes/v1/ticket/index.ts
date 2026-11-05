import Elysia from "elysia";
import { z } from "zod";
import { WorkItemController } from "@/app/dependencies";
import { TicketCreateSchema, TicketUpdateSchema, TicketSchema } from "@/database/data-transfer-object/ticket_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";

export const TicketRouter = new Elysia({ prefix: "/api/v1/tickets" })
  .use(authPlugin)
  .post("/", WorkItemController.create, { 
    body: TicketCreateSchema,
    response: { 201: TicketSchema, 403: ErrorSchema, 500: ErrorSchema }, tags: ["Tickets"], auth: true 
  })
  .get("/", WorkItemController.list, { 
    query: z.object({ limit: z.coerce.number().min(1).max(100).default(10), offset: z.coerce.number().min(0).default(0) }), 
    body: z.object({ type: z.string().min(1) }),
    response: { 200: z.array(TicketSchema), 500: ErrorSchema }, tags: ["Tickets"], auth: true 
  })
  .get("/project/:projectId", WorkItemController.listByProject, { 
    params: z.object({ projectId: z.uuid() }), 
    body: z.object({ type: z.string().min(1) }),
    response: { 200: z.array(TicketSchema), 500: ErrorSchema }, tags: ["Tickets"], auth: true 
  })
  .get("/counts", WorkItemController.counts, { 
    query: z.object({ projectIds: z.string() }),
    body: z.object({ type: z.string().min(1) }),
    response: { 200: z.object({ counts: z.record(z.string(), z.record(z.string(), z.number())) }), 500: ErrorSchema }, 
    tags: ["Tickets"], authOptional: true 
  })
  .put("/:id", WorkItemController.update, { 
    params: z.object({ id: z.uuid() }),
    body: TicketUpdateSchema, 
    response: { 200: TicketSchema, 404: ErrorSchema }, tags: ["Tickets"], auth: true 
  })
  .delete("/:id", WorkItemController.remove, { 
    params: z.object({ id: z.uuid() }), 
    body: z.object({ type: z.string().min(1) }),
    response: { 200: TicketSchema, 404: ErrorSchema }, tags: ["Tickets"], auth: true 
  });
