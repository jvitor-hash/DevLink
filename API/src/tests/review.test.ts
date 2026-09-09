import { describe, expect, test } from "bun:test";
import {
  ReviewCreateSchema,
  ReviewUpdateSchema,
  ReviewSchema,
} from "../database/data-transfer-object/review_dto";
import { ReviewRouter } from "../routes/v1/review";

describe("Review Schema Validation", () => {
  test("ReviewCreateSchema should validate correctly with real schema", () => {
    const validData = {
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      reviewedUserId: "550e8400-e29b-41d4-a716-446655440001",
      title: "Great developer!",
      description: "Delivered on time with high code quality.",
      rating: 5,
    };

    const result = ReviewCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(5);
      expect(result.data.title).toBe("Great developer!");
    }
  });

  test("ReviewCreateSchema should reject invalid rating (> 5 or < 1)", () => {
    const invalidDataHigh = {
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      reviewedUserId: "550e8400-e29b-41d4-a716-446655440001",
      title: "Review",
      description: "Good work",
      rating: 6,
    };

    const invalidDataLow = {
      ...invalidDataHigh,
      rating: 0,
    };

    expect(ReviewCreateSchema.safeParse(invalidDataHigh).success).toBe(false);
    expect(ReviewCreateSchema.safeParse(invalidDataLow).success).toBe(false);
  });

  test("ReviewCreateSchema should reject invalid UUID", () => {
    const invalidData = {
      projectId: "invalid-uuid",
      reviewedUserId: "550e8400-e29b-41d4-a716-446655440001",
      title: "Title",
      description: "Description",
      rating: 4,
    };

    const result = ReviewCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("ReviewUpdateSchema should accept partial updates", () => {
    const updateData = {
      rating: 4,
      description: "Updated review notes",
    };

    const result = ReviewUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });

  test("ReviewSchema should validate full entity", () => {
    const fullReview = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      projectId: "550e8400-e29b-41d4-a716-446655440001",
      reviewerId: "550e8400-e29b-41d4-a716-446655440002",
      reviewedUserId: "550e8400-e29b-41d4-a716-446655440003",
      title: "Excellent",
      description: "Very satisfied",
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = ReviewSchema.safeParse(fullReview);
    expect(result.success).toBe(true);
  });
});

describe("Review Route Definition", () => {
  test("ReviewRouter is properly configured", () => {
    expect(ReviewRouter).toBeDefined();
    expect(ReviewRouter.prefix).toBe("/api/v1/reviews");
  });
});
