import { useState } from "react";
import ProjectInfoPanel from "./project_info_panel";
import ProjectWorkPanel from "./project_work_panel";
import ProjectChatPanel from "./project_chat_panel";
import { useSavedTickets } from "@/lib/hooks/use_saved_tickets";
import { projectService } from "@/services/project_service";
import type { ProjectDTO } from "@/lib/types/database";
import { useLoaderData, type LoaderFunctionArgs } from "react-router-dom";

export async function ProjectOpenLoader({ params }: LoaderFunctionArgs): Promise<ProjectDTO> {
  if (!params.projectId)
    throw new Error("Projeto não encontrado.");

  const data = await projectService.getById(params.projectId);

  if (!data)
    throw new Error("Não foi possível carregar o projeto.");

  return { data };
}

export default function ProjectOpenPage() {
  const loaderData = useLoaderData<ProjectDTO>();
  const [project, setProject] = useState<ProjectDTO | null>(loaderData);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const { saveCounts, isSaved, toggleSaved, setSaveCountsFromProjects } =
    useSavedTickets();

  const handleProjectUpdated = (updated: ProjectDTO): void => {
    setProject(updated);
    setSaveCountsFromProjects([updated]);
  };

  return (
    <section className="flex flex-col gap-3 p-4">
      <div className="flex items-stretch gap-3">
        <ProjectChatPanel
          open={isChatOpen}
          onToggle={() => setIsChatOpen((prev) => !prev)}
        />
        <div className="min-w-0 flex-1">
          <ProjectInfoPanel
            project={project}
            isSaved={isSaved(project.id)}
            saveCount={saveCounts[project.id] ?? project.saveTotalCount ?? 0}
            onToggleSaved={() => toggleSaved(project.id)}
            onProjectUpdated={handleProjectUpdated}
            onOpenChat={() => setIsChatOpen(true)}
          />
        </div>
      </div>

      <ProjectWorkPanel projectId={project.id} />
    </section>
  );
}
