import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/button_component";
import ProjectInfoPanel from "./project_info_panel";
import ProjectWorkPanel from "./project_work_panel";
import ProjectChatPanel from "./project_chat_panel";
import { useSavedTickets } from "@/lib/hooks/use_saved_tickets";
import { projectService } from "@/services/project_service";
import type { ProjectDTO } from "@/lib/types/database";

/**
 * Single-project page: an organized project information panel with a
 * collaborative work area (TODOs/Kanban/progress), plus a chat dock that
 * floats over the page independently of this layout.
 */
export default function ProjectOpenPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const { saveCounts, isSaved, toggleSaved, setSaveCountsFromProjects } = useSavedTickets();

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      if (!projectId) {
        setError("Projeto não encontrado.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await projectService.getById(projectId);

        if (cancelled) return;

        setProject(data);
        setError(null);
      } catch (loadError: unknown) {
        if (cancelled) return;

        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o projeto.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Keep save counts in sync with the server's view after any action returns
  // a fresh DTO (e.g. status changes, save counter updates from other users).
  const handleProjectUpdated = (updated: ProjectDTO): void => {
    setProject(updated);
    setSaveCountsFromProjects([updated]);
  };

  if (isLoading) {
    return (
      <section className="p-6">
        <p className="text-(--text-muted)">Carregando...</p>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section className="p-6">
        <h1 className="text-2xl font-bold text-(--text-primary)">Erro</h1>
        <p className="mt-2 text-(--error)">{error ?? "Projeto não encontrado."}</p>
        <div className="mt-4">
          <Button label="Voltar" buttonType="button" colorType="secondary" onClick={() => navigate("/project")} />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mx-4 my-4 rounded-md border border-(--border-subtle) bg-(--surface-1)">
        <div className="flex h-full flex-col lg:flex-row">
          {/* Info panel: primary content */}
          <div className="min-w-0 flex-1">
            <ProjectInfoPanel
              project={project}
              isSaved={isSaved(project.id)}
              saveCount={saveCounts[project.id] ?? project.saveTotalCount ?? 0}
              onToggleSaved={() => toggleSaved(project.id)}
              onProjectUpdated={handleProjectUpdated}
            />
          </div>
        </div>
      </section>

      {/* Collaborative work area: TODOs, Kanban and progress */}
      <section className="mx-4 mb-4 rounded-md border border-(--border-subtle) bg-(--surface-1)">
        <ProjectWorkPanel projectId={project.id} />
      </section>

      {/* Chat dock: floats to the right, separate from the project layout */}
      <ProjectChatPanel open={isChatOpen} onToggle={() => setIsChatOpen((prev) => !prev)} />
    </>
  );
}
