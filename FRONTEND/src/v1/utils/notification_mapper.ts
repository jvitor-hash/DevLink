import type { NotificationDTO, ProjectEvent } from "@/data/types/database";

export const EVENT_TITLES: Record<ProjectEvent["type"], string> = {
  "project.saved": "Projeto salvo",
  "project.updated": "Projeto atualizado",
  "project.deleted": "Projeto excluído",
};

// Short human summary derived from the event payload.
export const describeEvent = (event: ProjectEvent): string => {
  const payload = event.payload ?? {};
  const title = typeof payload.title === "string" ? payload.title : null;
  const projectId = typeof payload.projectId === "string" ? payload.projectId : event.aggregateId;
  const changes = payload.changes;

  if (event.type === "project.updated" && changes && typeof changes === "object") {
    const fields = Object.keys(changes as Record<string, unknown>).join(", ");

    return fields ? `Campos alterados: ${fields}` : `Projeto ${projectId} foi atualizado.`;
  }

  if (title) return `${title} (${projectId})`;

  return `Projeto ${projectId}`;
};

// Maps a streamed project event to the notification view model the
// existing list item component already renders.
export const eventToNotification = (event: ProjectEvent, receivedAt: string, isRead: boolean, archived: boolean): NotificationDTO => ({
  id: event.id,
  userId: "",
  type: "SYSTEM",
  title: EVENT_TITLES[event.type],
  message: describeEvent(event),
  projectId: event.aggregateId,
  isRead,
  archived,
  createdAt: receivedAt,
});
