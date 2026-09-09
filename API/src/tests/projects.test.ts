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
      minBudget: "1000.00",
      maxBudget: "5000.00",
    };

    const result = ProjectCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("DevLink Platform");
      expect(result.data.platforms).toEqual(["WEB", "MOBILE"]);
      expect(result.data.primaryLanguage).toBe("TYPESCRIPT");
    }
  });

  test("ProjectCreateSchema should apply default values", () => {
    const minimalData = {
      title: "MVP Project",
      description: "Quick prototype",
      category: "Design",
      sub_category: "UI",
      platforms: ["WEB" as const],
      minBudget: "500",
      maxBudget: "1500",
    };

    const result = ProjectCreateSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.primaryLanguage).toBe("CSHARP");
      expect(result.data.status).toBe("OPEN");
      expect(result.data.audience).toBe("CLIENTS");
    }
  });

  test("ProjectCreateSchema should reject invalid data", () => {
    const invalidData = {
      title: "",
      description: "Missing platforms",
      category: "Web",
      sub_category: "Frontend",
      platforms: [],
      minBudget: "100",
      maxBudget: "500",
    };

    const result = ProjectCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
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

  test("ProjectDTOSchema should validate full entity", () => {
    const fullProject = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      clientId: "550e8400-e29b-41d4-a716-446655440001",
      programmerId: null,
      title: "Full Project",
      description: "Detailed description",
      category: "Software",
      sub_category: "API",
      primaryLanguage: "GO" as const,
      platforms: ["DESKTOP" as const],
      status: "OPEN" as const,
      audience: "INTERNAL_TOOL" as const,
      minBudget: "2000.00",
      maxBudget: "6000.00",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };

    const result = ProjectDTOSchema.safeParse(fullProject);
    expect(result.success).toBe(true);
  });
});

describe("Projects Route Definition", () => {
  test("ProjectsRouter is properly configured", () => {
    expect(ProjectsRouter).toBeDefined();
  });
});
