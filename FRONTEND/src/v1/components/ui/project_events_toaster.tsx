import { useCallback } from "react";
import { useProjectEvents } from "@/hooks/use_project_events";
import { toast } from "@/utils/toast_store";
import { userSingleton } from "@/context/user";
import type { ProjectEvent } from "@/data/types/database";

const EVENT_TITLES: Record<ProjectEvent["type"], string> = {
  "project.saved": "Projeto salvo com sucesso",
  "project.updated": "Projeto atualizado",
  "project.deleted": "Projeto excluído",
};

// Global live-event bridge: subscribes once per signed-in session and
// surfaces project events as toasts. Page-local reactions (refetch,
// redirect) are handled by page-level useProjectEvents subscriptions.
export default function ProjectEventsToaster() {
  const handleEvent = useCallback((event: ProjectEvent): void => {
    toast.info(EVENT_TITLES[event.type]);
  }, []);

  useProjectEvents(userSingleton.id ?? null, { onEvent: handleEvent });

  return null;
}
