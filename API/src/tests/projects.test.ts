import { describe, expect, test } from "bun:test";
import {
  ProjectCreateSchema,
  ProjectUpdateSchema,
  ProjectDTOSchema,
} from "../database/data-transfer-object/project_dto";
import { ProjectsRouter } from "../routes/v1/projects";

describe("Projects Schema Validation", () => {
  test("ProjectCreateSchema should validate real project payload", () => {
    const validData = {
      title: "DevLink Platform",
      description: "A platform for developers and clients",
      category: "Web Development",
      sub_category: "Fullstack",
      primaryLanguage: "TYPESCRIPT" as const,
      platforms: ["WEB" as const, "MOBILE" as const],
      status: "OPEN" as const,
      audience: "CLIENTS" as const,
      minBudget: 1000.00,
      maxBudget: 5000.00,
      // problem and user_actions are nullable but required in create schema
      problem: "Need a platform",
      user_actions: "Created project",
    };

    const result = ProjectCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("DevLink Platform");
      expect(result.data.platforms).toEqual(["WEB", "MOBILE"]);
      expect(result.data.primaryLanguage).toBe("TYPESCRIPT");
    }
  });

  test("ProjectCreateSchema should validate with null problem and user_actions", () => {
    const validData = {
      title: "MVP Project",
      description: "Quick prototype",
      category: "Design",
      sub_category: "UI",
      platforms: ["WEB" as const],
      minBudget: 500,
      maxBudget: 1500,
      problem: null,
      user_actions: null,
    };

    const result = ProjectCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.primaryLanguage).toBe("CSHARP");
      expect(result.data.status).toBe("OPEN");
      expect(result.data.audience).toBe("CLIENTS");
      expect(result.data.problem).toBe(null);
      expect(result.data.user_actions).toBe(null);
    }
  });

  test("ProjectCreateSchema should reject invalid data", () => {
    const invalidData = {
      title: "",
      description: "Missing platforms",
      category: "Web",
      sub_category: "Frontend",
      platforms: [],
      minBudget: 100,
      maxBudget: 500,
      problem: "test",
      user_actions: "test",
    };

    const result = ProjectCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("ProjectCreateSchema should reject missing required fields", () => {
    const incompleteData = {
      title: "Incomplete",
    };

    const result = ProjectCreateSchema.safeParse(incompleteData);
    expect(result.success).toBe(false);
  });

  test("ProjectCreateSchema should validate questionnaire payload without user_actions", () => {
    const questionnaireData = {
      title: "Questionnaire Project",
      description: "Created from the questionnaire flow",
      category: "Web Development",
      sub_category: "Fullstack",
      primaryLanguage: "TYPESCRIPT" as const,
      platforms: ["WEB" as const],
      audience: "CLIENTS" as const,
      minBudget: 1,
      maxBudget: 1,
      problem: null,
      affectedUsers: null,
      northQuestion: null,
      hypothesis: null,
      audiencePainPoints: null,
      audienceAssumptions: null,
      notAudience: null,
      requirements: null,
      successCriteria: null,
      valueProposition: null,
      differentiation: null,
    };

    const result = ProjectCreateSchema.safeParse(questionnaireData);
    expect(result.success).toBe(true);
  });

  test("ProjectCreateSchema should validate payload omitting problem and user_actions", () => {
    const minimalData = {
      title: "Minimal Project",
      description: "No questionnaire fields at all",
      category: "Web",
      sub_category: "Backend",
      platforms: ["WEB" as const],
      minBudget: 100,
      maxBudget: 200,
    };

    const result = ProjectCreateSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });

  test("ProjectCreateSchema should ignore client-supplied clientId", () => {
    const dataWithClientId = {
      clientId: "550e8400-e29b-41d4-a716-446655440001",
      title: "Test",
      description: "Desc",
      category: "Cat",
      sub_category: "Sub",
      platforms: ["WEB" as const],
      minBudget: 100,
      maxBudget: 200,
      problem: "Problem",
      user_actions: "Actions",
    };

    const result = ProjectCreateSchema.safeParse(dataWithClientId);
    expect(result.success).toBe(true);
    if (result.success) {
      expect("clientId" in result.data).toBe(false);
    }
  });

  test("ProjectUpdateSchema should accept partial updates", () => {
    const updateData = {
      title: "Updated Title",
      status: "IN_DEVELOPMENT" as const,
    };

    const result = ProjectUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Updated Title");
      expect(result.data.status).toBe("IN_DEVELOPMENT");
    }
  });

  test("ProjectUpdateSchema should accept empty update", () => {
    const emptyUpdate = {};

    const result = ProjectUpdateSchema.safeParse(emptyUpdate);
    expect(result.success).toBe(true);
  });

  test("ProjectDTOSchema should validate full entity with all fields", () => {
    const fullProject = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      clientId: "550e8400-e29b-41d4-a716-446655440001",
      programmerId: "550e8400-e29b-41d4-a716-446655440002",
      title: "Full Project",
      description: "Detailed description",
      category: "Software",
      sub_category: "API",
      problem: "Some problem",
      user_actions: "Some actions",
      primaryLanguage: "GO" as const,
      platforms: ["DESKTOP" as const],
      status: "OPEN" as const,
      audience: "INTERNAL_TOOL" as const,
      minBudget: 2000.00,
      maxBudget: 6000.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };

    const result = ProjectDTOSchema.safeParse(fullProject);
    expect(result.success).toBe(true);
  });

  test("ProjectDTOSchema should validate entity with nullable programmerId", () => {
    const projectWithNullableProgrammer = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      clientId: "550e8400-e29b-41d4-a716-446655440001",
      programmerId: null,
      title: "Full Project",
      description: "Detailed description",
      category: "Software",
      sub_category: "API",
      problem: "Some problem",
      user_actions: "Some actions",
      primaryLanguage: "GO",
      platforms: ["DESKTOP"],
      status: "OPEN",
      audience: "INTERNAL_TOOL",
      minBudget: 2000.00,
      maxBudget: 6000.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };

    const result = ProjectDTOSchema.safeParse(projectWithNullableProgrammer);
    expect(result.success).toBe(true);
  });
});

describe("Projects Route Definition", () => {
  test("ProjectsRouter is properly configured", () => {
    expect(ProjectsRouter).toBeDefined();
    expect(typeof ProjectsRouter.prefix).toBe("function");
  });
});

