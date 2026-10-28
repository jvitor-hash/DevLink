import { describe, expect, test } from "bun:test";
import {
  TodoCreateSchema,
  TodoUpdateSchema,
  TodoSchema,
} from "../database/data-transfer-object/todo_dto";
import {
  TicketCreateSchema,
  TicketUpdateSchema,
  TicketSchema,
} from "../database/data-transfer-object/ticket_dto";
import { TodoRouter } from "../routes/v1/todo";
import { TicketRouter } from "../routes/v1/ticket";
import { createWorkItemController } from "../domains/work_items/controller";
import type { WorkItemService } from "../domains/work_items/ports";

const user = { id: "user-1" };
const todo = { id: "todo-1", projectId: "project-1", title: "Write tests" };
const createSet = () => ({ headers: {}, status: undefined as number | undefined });

const createMockService = (): WorkItemService<
  { projectId: string; title: string },
  { title?: string },
  typeof todo,
  Record<string, number>
> => ({
  createForProject: async () => todo,
  findAllByUser: async () => [todo],
  findAllByProject: async () => [todo],
  countByProjects: async () => ({ "project-1": 1 }),
  updateForUser: async () => todo,
  removeForUser: async () => todo,
});

describe("Todo Schema Validation", () => {
  test("TodoCreateSchema should validate todo payload", () => {
    const result = TodoCreateSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Setup repo",
      description: "Initial scaffolding",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Setup repo");
      expect(result.data.isDone).toBe(false);
    }
  });

  test("TodoCreateSchema should reject empty title", () => {
    const result = TodoCreateSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      title: "",
    });

    expect(result.success).toBe(false);
  });

  test("TodoUpdateSchema should accept isDone toggle", () => {
    const result = TodoUpdateSchema.safeParse({ isDone: true });
    expect(result.success).toBe(true);
  });

  test("TodoSchema should validate full entity", () => {
    const result = TodoSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      projectId: "550e8400-e29b-41d4-a716-446655440001",
      creatorId: "550e8400-e29b-41d4-a716-446655440002",
      title: "Full todo",
      description: null,
      isDone: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(result.success).toBe(true);
  });
});

describe("Ticket Schema Validation", () => {
  test("TicketCreateSchema should validate kanban ticket payload", () => {
    const result = TicketCreateSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Build login page",
      status: "IN_PROGRESS",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("IN_PROGRESS");
    }
  });

  test("TicketCreateSchema should reject invalid status", () => {
    const result = TicketCreateSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Ticket",
      status: "ARCHIVED",
    });

    expect(result.success).toBe(false);
  });

  test("TicketUpdateSchema should accept status move", () => {
    const result = TicketUpdateSchema.safeParse({ status: "REVIEW", position: 2 });
    expect(result.success).toBe(true);
  });

  test("TicketSchema should validate full entity", () => {
    const result = TicketSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      projectId: "550e8400-e29b-41d4-a716-446655440001",
      creatorId: "550e8400-e29b-41d4-a716-446655440002",
      assigneeId: null,
      title: "Full ticket",
      description: null,
      status: "BACKLOG",
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(result.success).toBe(true);
  });
});

describe("Todo and Ticket Route Definition", () => {
  test("TodoRouter is properly configured", () => {
    expect(TodoRouter).toBeDefined();
    expect(typeof TodoRouter.prefix).toBe("function");
  });

  test("TicketRouter is properly configured", () => {
    expect(TicketRouter).toBeDefined();
    expect(typeof TicketRouter.prefix).toBe("function");
  });
});

describe("Shared Work Item Controller", () => {
  test("delegates creation with the authenticated user as creator", async () => {
    const service = createMockService();
    const controller = createWorkItemController(service, "todo");
    const set = createSet();

    const result = await controller.create({
      body: { projectId: "project-1", title: "Write tests" },
      user,
      set,
    });

    expect(result).toEqual(todo);
    expect(set.status).toBe(201);
  });

  test("returns a forbidden response when creation is unauthorized", async () => {
    const service = createMockService();
    service.createForProject = async () => {
      throw new Error("Project not found or unauthorized");
    };
    const controller = createWorkItemController(service, "todo");
    const set = createSet();

    const result = await controller.create({
      body: { projectId: "project-1", title: "Write tests" },
      user,
      set,
    });

    expect(result).toEqual({ error: "Not a project participant" });
    expect(set.status).toBe(403);
  });

  test("delegates list, update, and remove operations", async () => {
    const service = createMockService();
    const controller = createWorkItemController(service, "todo");
    const set = createSet();

    expect(await controller.list({ query: { limit: 10, offset: 0 }, user, set })).toEqual([todo]);
    expect(await controller.update({ params: { id: "todo-1" }, body: { title: "Updated" }, user, set })).toEqual(todo);
    expect(await controller.remove({ params: { id: "todo-1" }, user, set })).toEqual(todo);
  });
});
