import { describe, expect, test } from "bun:test";
import {
  ProjectCreateSchema,
  ProjectUpdateSchema,
} from "../database/data-transfer-object/project_dto";
import {
  UserPreferenceCreateSchema,
  UserPreferenceUpdateSchema,
} from "../database/data-transfer-object/user_preferences_dto";
import { ReviewCreateSchema } from "../database/data-transfer-object/review_dto";
import { NotificationCreateSchema } from "../database/data-transfer-object/notification_dto";

const baseProject = {
  title: "Budget Range Project",
  description: "Validate min/max budget refinement",
  category: "Web",
  sub_category: "Backend",
  platforms: ["WEB" as const],
  minBudget: 100,
  maxBudget: 500,
};

describe("Project Budget Range Validation", () => {
  test("ProjectCreateSchema should accept maxBudget equal to minBudget", () => {
    const result = ProjectCreateSchema.safeParse({ ...baseProject, maxBudget: 100 });
    expect(result.success).toBe(true);
  });

  test("ProjectCreateSchema should reject maxBudget below minBudget", () => {
    const result = ProjectCreateSchema.safeParse({ ...baseProject, maxBudget: 99 });
    expect(result.success).toBe(false);
  });

  test("ProjectCreateSchema should accept deadline ISO string", () => {
    const result = ProjectCreateSchema.safeParse({
      ...baseProject,
      deadline: new Date(Date.now() + 86_400_000).toISOString(),
    });
    expect(result.success).toBe(true);
  });

  test("ProjectUpdateSchema should reject inconsistent budget pair", () => {
    const result = ProjectUpdateSchema.safeParse({ minBudget: 300, maxBudget: 100 });
    expect(result.success).toBe(false);
  });

  test("ProjectUpdateSchema should accept single budget field update", () => {
    const result = ProjectUpdateSchema.safeParse({ minBudget: 300 });
    expect(result.success).toBe(true);
  });
});

describe("User Preference Constraint Validation", () => {
  test("UserPreferenceCreateSchema should accept new constraint fields", () => {
    const result = UserPreferenceCreateSchema.safeParse({
      language: "TYPESCRIPT",
      platform: "WEB",
      maxDeadlineDays: "90",
      minBudget: 100,
      maxBudget: 5000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe("TYPESCRIPT");
      expect(result.data.platform).toBe("WEB");
      expect(result.data.maxDeadlineDays).toBe("90");
    }
  });

  test("UserPreferenceCreateSchema should default constraints to ALL and no budget filter", () => {
    const result = UserPreferenceCreateSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe("ALL");
      expect(result.data.platform).toBe("ALL");
      expect(result.data.minBudget).toBe(0);
      expect(result.data.maxBudget).toBe(0);
    }
  });

  test("UserPreferenceCreateSchema should reject invalid language preference", () => {
    const result = UserPreferenceCreateSchema.safeParse({ language: "FORTRAN" });
    expect(result.success).toBe(false);
  });

  test("UserPreferenceCreateSchema should reject non numeric maxDeadlineDays", () => {
    const result = UserPreferenceCreateSchema.safeParse({ maxDeadlineDays: "soon" });
    expect(result.success).toBe(false);
  });

  test("UserPreferenceUpdateSchema should accept constraint updates", () => {
    const result = UserPreferenceUpdateSchema.safeParse({ minBudget: 50, maxBudget: 1000 });
    expect(result.success).toBe(true);
  });
});

describe("Notification and Review Enum Updates", () => {
  test("NotificationCreateSchema should accept NEW_PROJECT type", () => {
    const result = NotificationCreateSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440001",
      type: "NEW_PROJECT",
      title: "Novo projeto",
      message: "Um novo projeto foi publicado",
    });
    expect(result.success).toBe(true);
  });

  test("ReviewCreateSchema should accept rating 0 and 5", () => {
    const zero = ReviewCreateSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      reviewedUserId: "550e8400-e29b-41d4-a716-446655440001",
      title: "Review",
      description: "Zero stars",
      rating: 0,
    });
    const five = ReviewCreateSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      reviewedUserId: "550e8400-e29b-41d4-a716-446655440001",
      title: "Review",
      description: "Five stars",
      rating: 5,
    });
    expect(zero.success).toBe(true);
    expect(five.success).toBe(true);
  });
});
