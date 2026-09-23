import type { Audience, PlatformType, ProgrammingLanguage, ProjectStatus } from "./database";

export type ProjectFilters = {
  q: string;
  category: string;
  sub_category: string;
  audience: "ALL" | Audience;
  platforms: "ALL" | PlatformType;
  primaryLanguage: "ALL" | ProgrammingLanguage;
  status: "ALL" | ProjectStatus;
  minBudget: string;
  maxBudget: string;
};

export const EMPTY_FILTERS: ProjectFilters = {
  q: "",
  category: "ALL",
  sub_category: "ALL",
  audience: "ALL",
  platforms: "ALL",
  primaryLanguage: "ALL",
  status: "ALL",
  minBudget: "",
  maxBudget: "",
};

/** Statuses excluded from the public projects page listing. */
export const HIDDEN_PROJECT_STATUSES = ["IN_DEVELOPMENT", "COMPLETED", "CANCELLED"];
