import { isProjectConcluded, type ProjectStatus } from "@/modules/project_status";

export type ChatCapability = "NONE" | "VIEW" | "MESSAGE" | "OFFER";

type ProjectRow = {
  id: string;
  clientId: string;
  programmerId: string | null;
  status: ProjectStatus;
};

// Negotiation states where the chat is still open to every programmer;
// once an offer is accepted (IN_DEVELOPMENT) the room is locked to its participants.
const NEGOTIATION_OPEN_STATUSES: ProjectStatus[] = ["OPEN", "NEGOTIATING"];

export const isNegotiationOpen = (status: string): boolean =>
  NEGOTIATION_OPEN_STATUSES.includes(status as ProjectStatus);

// Capability for a user on a project: NONE, VIEW, MESSAGE or OFFER.
// The chat is read-only for every client (including the creator); messages
// and offers come from programmers only, and offers stop once the project
// is concluded or already assigned to a developer.
export const resolveChatCapability = (
  project: Pick<ProjectRow, "clientId" | "programmerId" | "status">,
  userId: string,
  role: string | null,
): ChatCapability => {
  if (isProjectConcluded(project.status)) return "NONE";

  const isAssignedProgrammer = Boolean(project.programmerId) && project.programmerId === userId;

  if (isAssignedProgrammer) return "OFFER";

  if (role === "PROGRAMMER" && isNegotiationOpen(project.status)) return "OFFER";

  // The creator and every other client can only watch the conversation.
  if (role === "CLIENT") return "VIEW";

  return "NONE";
};

export const canViewChat = (
  project: Pick<ProjectRow, "clientId" | "programmerId" | "status">,
  userId: string,
  role: string | null,
): boolean => resolveChatCapability(project, userId, role) !== "NONE";

export const canPostMessage = (
  project: Pick<ProjectRow, "clientId" | "programmerId" | "status">,
  userId: string,
  role: string | null,
): boolean => {
  const capability = resolveChatCapability(project, userId, role);

  return capability === "MESSAGE" || capability === "OFFER";
};

export const canPostOffer = (
  project: Pick<ProjectRow, "clientId" | "programmerId" | "status">,
  userId: string,
  role: string | null,
): boolean => resolveChatCapability(project, userId, role) === "OFFER";
