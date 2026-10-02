import { useCallback, useState } from "react";
import ProjectInfoPanel from "./project_info_panel";
import ProjectWorkPanel from "./project_work_panel";
import ProjectChatPanel from "./project_chat_panel";
import { projectService } from "@/data/services/project_service";
import type { ProjectDTO, ProjectEvent } from "@/data/types/database";
import { useLoaderData, type LoaderFunctionArgs } from "react-router-dom";
import { useProjectEvents } from "@/hooks/use_project_events";
import { reportError } from "@/utils/report_error";

export async function ProjectOpenLoader({ params }: LoaderFunctionArgs): Promise<ProjectDTO> {
  if (!params.projectId)
    throw new Error("Projeto não encontrado.");

  const data = await projectService.getById(params.projectId);

  if (!data)
    throw new Error("Não foi possível carregar o projeto.");

  return data;
}

export default function ProjectOpenPage() {
  const loaderData = useLoaderData<ProjectDTO>();
  // The loader throws before render when the project is missing, so it is never null here.
  const [project, setProject] = useState<ProjectDTO>(loaderData);

  const handleProjectUpdated = (updated: ProjectDTO): void => {
    setProject(updated);
  };

  // Live updates: when someone saves/updates this project, refetch it and
  // inform the current viewer. The actor's own events still arrive (delivery
  // is at-least-once) but refetching own changes is harmless and keeps one path.
  const handleEvent = useCallback((_event: ProjectEvent): void => {
    projectService
      .getById(project.id)
      .then((fresh) => {
        if (fresh) setProject(fresh);
      })
      .catch((error: unknown) => reportError("project_open: refetch após evento", error, "Não foi possível atualizar o projeto."));
  }, [project.id]);

  useProjectEvents(project.id, { onEvent: handleEvent });

  return (
    <section className="mx-auto w-full px-2 py-4 lg:px-6 lg:py-6">
      <header className="mb-4">
        <h1 className="gb-heading text-3xl tracking-tight">Projeto</h1>
        <div className="gb-rule-heavy mt-2 h-[3px] bg-(--gb-ink) border-0" />
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-stretch gap-3 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col">
            <ProjectInfoPanel
              project={project}
              onProjectUpdated={handleProjectUpdated}
            />
          </div>

          <ProjectChatPanel />
        </div>

        {/* Keyed per project so board and checklist state never leak across projects. */}
        <ProjectWorkPanel key={project.id} projectId={project.id} />
      </div>
    </section>
  );
}
