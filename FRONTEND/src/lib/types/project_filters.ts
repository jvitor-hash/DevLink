export type ProjectFilters = {
  category: string;
  sub_category: string;
  audience: string;
  platforms: string;
  primaryLanguage: string;
  status: string;
  minBudget: string;
  maxBudget: string;
};

export const EMPTY_FILTERS: ProjectFilters = {
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
