import { projectStatusEnum } from "@/database/schema/enums_schema";

export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];

export const CONCLUDED_PROJECT_STATUSES: ProjectStatus[] = ["COMPLETED", "CANCELLED"];

export const isProjectConcluded = (status: string): boolean =>
  CONCLUDED_PROJECT_STATUSES.includes(status as ProjectStatus);

export type OfferResponse = "ACCEPTED" | "REJECTED";

export type OfferProjectPatch = {
  status: ProjectStatus;
  negotiationStartedAt: Date | null;
};

// Project patch implied by an offer response; null when the project must not
// change (concluded or already assigned to a programmer).
export const offerResponseProjectPatch = (
  currentStatus: string,
  response: OfferResponse,
): OfferProjectPatch | null => {
  if (isProjectConcluded(currentStatus) || currentStatus === "IN_DEVELOPMENT") return null;

  if (response === "ACCEPTED") {
    return { status: "IN_DEVELOPMENT", negotiationStartedAt: null };
  }

  return { status: "NEGOTIATING", negotiationStartedAt: new Date() };
};

export const isNegotiationExpired = (
  negotiationStartedAt: Date | null,
  timeoutMs: number,
  now: Date = new Date(),
): boolean => {
  if (!negotiationStartedAt) return false;

  return negotiationStartedAt.getTime() <= now.getTime() - timeoutMs;
};
