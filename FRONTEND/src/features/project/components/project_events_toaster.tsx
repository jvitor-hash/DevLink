import { useProjectEvents } from "../hooks/use_project_events";
import { toast } from "@/shared/utils/toast_store";
import type { ProjectEvent } from "@/shared/types/database";

export interface ProjectEventsToasterProps {
  projectId?: string | null;
  scope?: "project" | "global";
}

export function ProjectEventsToaster({ projectId = null, scope = "global" }: ProjectEventsToasterProps) {
  useProjectEvents(projectId, {
    scope,
    onEvent: (event: ProjectEvent) => {
      const type = event.type;
      const title = (event.payload?.title as string) || `Projeto #${event.aggregateId.slice(0, 8)}`;

      if (type === "project.saved") {
        toast.info(`Novo interesse: ${title} foi salvo por um usuário!`);
      } else if (type === "project.updated") {
        toast.info(`Atualização: ${title} foi modificado.`);
      } else if (type === "project.deleted") {
        toast.error(`Aviso: ${title} foi removido.`);
      }
    },
  });

  return null;
}
