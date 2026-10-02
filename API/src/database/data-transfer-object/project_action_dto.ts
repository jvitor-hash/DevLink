import { z } from "zod";
import { ProjectCreateSchema, ProjectUpdateSchema } from "./project_dto";
import { idSchema } from "./helper";

export const ProjectActionTypeSchema = z.enum([
  "SAVE_PROJECT",
  "UPDATE_PROJECT",
  "DELETE_PROJECT",
]);

export const ProjectActionRequestSchema = z.object({
  action: ProjectActionTypeSchema,
  payload: z.record(z.string(), z.unknown()),
});

export const ProjectActionAcceptedSchema = z.object({
  actionId: idSchema,
  eventId: idSchema,
  status: z.literal("PENDING"),
});

// Project events streamed over SSE carry a small aggregate reference plus
// whatever the domain write produced; recipients never leave the server.
export const ProjectEventPayloadSchema = z.object({
  type: z.string(),
  aggregateType: z.string(),
  aggregateId: idSchema,
  payload: z.record(z.string(), z.unknown()),
});

export const PROJECT_EVENT_TYPES = {
  SAVE_PROJECT: "project.saved",
  UPDATE_PROJECT: "project.updated",
  DELETE_PROJECT: "project.deleted",
} as const;

export type ProjectActionRequest = z.infer<typeof ProjectActionRequestSchema>;
export type ProjectActionAccepted = z.infer<typeof ProjectActionAcceptedSchema>;
export type ProjectEventPayload = z.infer<typeof ProjectEventPayloadSchema>;
