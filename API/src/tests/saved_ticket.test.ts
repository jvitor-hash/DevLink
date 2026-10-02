import { describe, expect, test } from "bun:test";
import {
  ProjectActionAcceptedSchema,
  ProjectActionRequestSchema,
  PROJECT_EVENT_TYPES,
} from "../database/data-transfer-object/project_action_dto";

const UUID_A = "550e8400-e29b-41d4-a716-446655440000";
const UUID_B = "550e8400-e29b-41d4-a716-446655440001";

describe("Project Action Request Schema", () => {
  test("accepts SAVE_PROJECT with a create payload", () => {
    const result = ProjectActionRequestSchema.safeParse({
      action: "SAVE_PROJECT",
      payload: {
        title: "New project",
        description: "From the action router",
        category: "Web",
        sub_category: "Fullstack",
        platforms: ["WEB"],
        minBudget: 100,
        maxBudget: 200,
      },
    });

    expect(result.success).toBe(true);
  });

  test("accepts UPDATE_PROJECT and DELETE_PROJECT with a project id", () => {
    const update = ProjectActionRequestSchema.safeParse({
      action: "UPDATE_PROJECT",
      payload: { projectId: UUID_A, title: "Renamed" },
    });
    const remove = ProjectActionRequestSchema.safeParse({
      action: "DELETE_PROJECT",
      payload: { projectId: UUID_B },
    });

    expect(update.success).toBe(true);
    expect(remove.success).toBe(true);
  });

  test("rejects unknown actions and malformed payloads", () => {
    const unknown = ProjectActionRequestSchema.safeParse({
      action: "ARCHIVE_PROJECT",
      payload: {},
    });
    const badPayload = ProjectActionRequestSchema.safeParse({
      action: "SAVE_PROJECT",
      payload: "not-an-object",
    });

    expect(unknown.success).toBe(false);
    expect(badPayload.success).toBe(false);
  });
});

describe("Project Action Accepted Schema", () => {
  test("validates the 202 contract", () => {
    const result = ProjectActionAcceptedSchema.safeParse({
      actionId: UUID_A,
      eventId: UUID_B,
      status: "PENDING",
    });

    expect(result.success).toBe(true);

    const wrongStatus = ProjectActionAcceptedSchema.safeParse({
      actionId: UUID_A,
      eventId: UUID_B,
      status: "DONE",
    });

    expect(wrongStatus.success).toBe(false);
  });
});

describe("Project Event Contracts", () => {
  test("maps each action to its SSE event type", () => {
    expect(PROJECT_EVENT_TYPES.SAVE_PROJECT).toBe("project.saved");
    expect(PROJECT_EVENT_TYPES.UPDATE_PROJECT).toBe("project.updated");
    expect(PROJECT_EVENT_TYPES.DELETE_PROJECT).toBe("project.deleted");
  });
});
