import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/client";
import { schemas } from "@/database/schema";
import { ProjectCreateSchema, ProjectUpdateSchema } from "@/database/data-transfer-object/project_dto";

export type HandlerResult = {
  eventId: string;
  status: "PENDING";
};

type HandlerArgs = {
  userId: string;
  payload: unknown;
  idempotencyKey: string | undefined;
};

export class ActionError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Zod strips unknown keys, so client-supplied clientId/saveTotalCount never reach the DB.
const SaveProjectSchema = ProjectCreateSchema;

const assertProjectOwnership = async (tx: Tx, projectId: string, userId: string): Promise<void> => {
  const rows = await tx
    .select({ clientId: schemas.project.clientId })
    .from(schemas.project)
    .where(eq(schemas.project.id, projectId))
    .limit(1);

  if (!rows.length) {
    throw new ActionError("Project not found", 404);
  }

  if (rows[0].clientId !== userId) {
    throw new ActionError("Not authorized for this project", 403);
  }
};

export const saveProjectHandler = async ({ userId, payload, idempotencyKey }: HandlerArgs): Promise<HandlerResult> => {
  const data = SaveProjectSchema.parse(payload);

  return db.transaction(async (tx) => {
    const [project] = await tx
      .insert(schemas.project)
      .values({ ...data, clientId: userId })
      .returning();

    const [event] = await tx
      .insert(schemas.outbox)
      .values({
        event_type: "project.save_project",
        aggregate_type: "project",
        aggregate_id: project.id,
        payload: { projectId: project.id, title: project.title, savedBy: userId, audience: [userId] },
        status: "PENDING",
        idempotency_key: idempotencyKey,
      })
      .returning();

    return { eventId: event.id, status: "PENDING" as const };
  });
};

export const updateProjectHandler = async ({ userId, payload, idempotencyKey }: HandlerArgs): Promise<HandlerResult> => {
  const raw = (payload ?? {}) as Record<string, unknown>;
  const projectId = z.uuid().parse(raw.projectId);
  const data = ProjectUpdateSchema.parse(payload);

  return db.transaction(async (tx) => {
    await assertProjectOwnership(tx, projectId, userId);

    const { projectId: _ignored, ...updates } = data as { projectId?: string };

    const [project] = await tx
      .update(schemas.project)
      .set(updates)
      .where(eq(schemas.project.id, projectId))
      .returning();

    const [event] = await tx
      .insert(schemas.outbox)
      .values({
        event_type: "project.update_project",
        aggregate_type: "project",
        aggregate_id: project.id,
        payload: {
          projectId: project.id,
          updatedBy: userId,
          changes: updates,
          audience: [project.clientId, project.programmerId].filter((id): id is string => Boolean(id)),
        },
        status: "PENDING",
        idempotency_key: idempotencyKey,
      })
      .returning();

    return { eventId: event.id, status: "PENDING" as const };
  });
};

export const deleteProjectHandler = async ({ userId, payload, idempotencyKey }: HandlerArgs): Promise<HandlerResult> => {
  const raw = (payload ?? {}) as Record<string, unknown>;
  const projectId = z.uuid().parse(raw.projectId);

  return db.transaction(async (tx) => {
    await assertProjectOwnership(tx, projectId, userId);

    const [project] = await tx
      .delete(schemas.project)
      .where(eq(schemas.project.id, projectId))
      .returning();

    const [event] = await tx
      .insert(schemas.outbox)
      .values({
        event_type: "project.delete_project",
        aggregate_type: "project",
        aggregate_id: projectId,
        payload: {
          projectId,
          deletedBy: userId,
          audience: [project.clientId, project.programmerId].filter((id): id is string => Boolean(id)),
        },
        status: "PENDING",
        idempotency_key: idempotencyKey,
      })
      .returning();

    return { eventId: event.id, status: "PENDING" as const };
  });
};