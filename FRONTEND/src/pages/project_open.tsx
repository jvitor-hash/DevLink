import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectDetails } from "@/features/project/hooks/use_project_details";
import { useCurrentUser } from "@/features/auth/hooks/use_current_user";
import { useProjectEvents } from "@/features/project/hooks/use_project_events";
import { ProjectInfoPanel } from "@/features/work_items/components/project_info_panel";
import { ProjectWorkPanel } from "@/features/work_items/components/project_work_panel";
import { ChatModal } from "@/features/chat/components/chat_modal";

export default function ProjectOpenPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, loading, error, refetch } = useProjectDetails(projectId);
  const user = useCurrentUser();
  const [chatOpen, setChatOpen] = useState(false);

  useProjectEvents(projectId ?? null, {
    onEvent: () => {
      refetch();
    },
  });

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 text-center text-sm text-(--text-muted)">
        Carregando detalhes do projeto...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 text-center text-sm text-(--error)">
        {error ?? "Projeto não encontrado."}
      </div>
    );
  }

  const canAccessWorkPanel = user?.role !== "PROGRAMMER" || project.programmerId === user?.id;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 flex flex-col gap-6">
      <ProjectInfoPanel
        project={project}
        onOpenChat={() => setChatOpen(true)}
      />
      {canAccessWorkPanel && (
        <ProjectWorkPanel key={project.id} projectId={project.id} />
      )}
      <ChatModal
        projectId={project.id}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
