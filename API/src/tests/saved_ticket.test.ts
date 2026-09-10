import { describe, expect, test } from "bun:test";
import {
  SavedTicketCreateSchema,
  SavedTicketUpdateSchema,
  SavedTicketSchema,
} from "../database/data-transfer-object/saved_ticket";
import { SavedTicketRouter } from "../routes/v1/saved_ticket";

describe("SavedTicket Schema Validation", () => {
  test("SavedTicketCreateSchema should validate bookmark payload", () => {
    const validData = {
      projectId: "550e8400-e29b-41d4-a716-446655440000",
    };

    const result = SavedTicketCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projectId).toBe("550e8400-e29b-41d4-a716-446655440000");
    }
  });

  test("SavedTicketCreateSchema should reject invalid project UUID", () => {
    const invalidData = {
      projectId: "invalid-uuid",
    };

    const result = SavedTicketCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("SavedTicketCreateSchema should reject missing projectId", () => {
    const invalidData = {};

    const result = SavedTicketCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("SavedTicketSchema should validate full entity", () => {
    const fullSavedTicket = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      projectId: "550e8400-e29b-41d4-a716-446655440002",
      createdAt: new Date().toISOString(),
    };

    const result = SavedTicketSchema.safeParse(fullSavedTicket);
    expect(result.success).toBe(true);
  });

  test("SavedTicketSchema should validate entity with null createdAt", () => {
    const savedTicketWithNullDate = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      projectId: "550e8400-e29b-41d4-a716-446655440002",
      createdAt: null,
    };

    const result = SavedTicketSchema.safeParse(savedTicketWithNullDate);
    expect(result.success).toBe(true);
  });

  test("SavedTicketUpdateSchema should accept partial updates", () => {
    const updateData = {
      projectId: "550e8400-e29b-41d4-a716-446655440003",
    };

    const result = SavedTicketUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });
});

describe("SavedTicket Route Definition", () => {
  test("SavedTicketRouter is properly configured", () => {
    expect(SavedTicketRouter).toBeDefined();
    expect(typeof SavedTicketRouter.prefix).toBe("function");
  });
});
