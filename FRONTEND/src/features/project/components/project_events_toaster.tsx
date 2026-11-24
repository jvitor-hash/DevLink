import { useProjectEvents } from "../hooks/use_project_events";
import { toast } from "@/shared/utils/toast_store";

export function ProjectEventsToaster(projectId = null, scope: "project" | "global") {
  useProjectEvents(projectId, {
    scope,
    onEvent: (event) => {
      const type = event.type;
      const title = (event.payload?.title as string) || `Projeto #${event.aggregateId.slice(0, 8)}`;

      if (type === "project.updated") {
        toast.info(`Atualização: ${title} foi modificado.`);
      } else if (type === "project.deleted") {
        toast.error(`Aviso: ${title} foi removido.`);
      }
    },
  });

  return null;
}
