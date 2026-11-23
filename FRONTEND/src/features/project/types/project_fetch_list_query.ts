export interface ProjectFetchListQuery {
  audience?: string;
  platforms?: string | string[];
  primaryLanguage?: string;
  status?: string;
  excludeStatuses?: string | string[];
  minBudget?: number;
  maxBudget?: number;
  q?: string;
  category?: string;
  sub_category?: string;
  clientId?: string;
}