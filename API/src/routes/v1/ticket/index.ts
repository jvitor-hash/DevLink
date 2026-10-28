import Elysia from "elysia";
import { z } from "zod";
import { TicketController as controller } from "@/app/dependencies";
import { TicketCreateSchema, TicketUpdateSchema, TicketSchema } from "@/database/data-transfer-object/ticket_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";

const pagination = z.object({ limit: z.coerce.number().min(1).max(100).default(10), offset: z.coerce.number().min(0).default(0) });
const id = z.object({ id: z.string().uuid() });

export const TicketRouter = new Elysia({ prefix: "/api/v1/tickets" })
  .use(authPlugin)
  .post("/", controller.create, { body: TicketCreateSchema, response: { 201: TicketSchema, 403: ErrorSchema, 500: ErrorSchema }, tags: ["Tickets"], auth: true })
  .get("/", controller.list, { query: pagination, response: { 200: z.array(TicketSchema), 500: ErrorSchema }, tags: ["Tickets"], auth: true })
  .get("/project/:projectId", controller.listByProject, { params: z.object({ projectId: z.string().uuid() }), response: { 200: z.array(TicketSchema), 500: ErrorSchema }, tags: ["Tickets"], auth: true })
  .get("/counts", controller.counts, { query: z.object({ projectIds: z.string() }), response: { 200: z.object({ counts: z.record(z.string(), z.record(z.string(), z.number())) }), 500: ErrorSchema }, tags: ["Tickets"], authOptional: true })
  .put("/:id", controller.update, { params: id, body: TicketUpdateSchema, response: { 200: TicketSchema, 404: ErrorSchema }, tags: ["Tickets"], auth: true })
  .delete("/:id", controller.remove, { params: id, response: { 200: TicketSchema, 404: ErrorSchema }, tags: ["Tickets"], auth: true });
