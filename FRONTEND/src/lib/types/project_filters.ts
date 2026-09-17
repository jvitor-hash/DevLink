export type ProjectFilters = {
  audience: string;
  platforms: string;
  primaryLanguage: string;
  status: string;
  minBudget: string;
  maxBudget: string;
};

export const EMPTY_FILTERS: ProjectFilters = {
  audience: "ALL",
  platforms: "ALL",
  primaryLanguage: "ALL",
  status: "ALL",
  minBudget: "",
  maxBudget: "",
};
