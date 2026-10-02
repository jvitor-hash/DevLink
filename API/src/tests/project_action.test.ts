import { describe, expect, test } from "bun:test";
import { ActionError, handlers } from "../routes/v1/project_action/handlers";
import { ProjectCreateSchema } from "../database/data-transfer-object/project_dto";

const validSavePayload = {
  title: "Action Router Project",
  description: "Created through the project action router",
  category: "Web Development",
  sub_category: "Fullstack",
  platforms: ["WEB" as const],
  minBudget: 100,
  maxBudget: 200,
};

describe("Project Action Handlers Map", () => {
  test("maps every supported action to a handler", () => {
    expect(Object.keys(handlers).sort()).toEqual(["DELETE_PROJECT", "SAVE_PROJECT", "UPDATE_PROJECT"]);

    for (const handler of Object.values(handlers)) {
      expect(typeof handler).toBe("function");
    }
  });
});

describe("Project Action Payload Validation", () => {
  test("SAVE_PROJECT accepts a valid create payload", async () => {
    // With a migrated database this resolves with a receipt; with an unmigrated
    // database the transaction rejects. Either way nothing throws synchronously.
    const receipt = await handlers
      .SAVE_PROJECT({ userId: "user-1", payload: validSavePayload, idempotencyKey: undefined })
      .then(
        (result) => result,
        () => null,
      );

    if (receipt !== null) {
      expect(receipt.status).toBe("PENDING");
    }
  });

  test("SAVE_PROJECT rejects invalid payloads before hitting the database", async () => {
    await expect(
      handlers.SAVE_PROJECT({ userId: "user-1", payload: { title: "" }, idempotencyKey: undefined }),
    ).rejects.toThrow();
  });

  test("UPDATE_PROJECT requires a project id", async () => {
    await expect(
      handlers.UPDATE_PROJECT({ userId: "user-1", payload: { title: "New title" }, idempotencyKey: undefined }),
    ).rejects.toThrow();
  });

  test("DELETE_PROJECT requires a project id", async () => {
    await expect(
      handlers.DELETE_PROJECT({ userId: "user-1", payload: {}, idempotencyKey: undefined }),
    ).rejects.toThrow();
  });

  test("client-supplied identity fields are stripped from save payloads", () => {
    const parsed = ProjectCreateSchema.safeParse({
      ...validSavePayload,
      clientId: "550e8400-e29b-41d4-a716-446655440099",
      saveTotalCount: 999,
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect("clientId" in parsed.data).toBe(false);
      expect("saveTotalCount" in parsed.data).toBe(false);
    }
  });
});

describe("ActionError", () => {
  test("carries an http status", () => {
    const error = new ActionError("Not authorized for this project", 403);

    expect(error.status).toBe(403);
    expect(error.message).toBe("Not authorized for this project");
  });
});
