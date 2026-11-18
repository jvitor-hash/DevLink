import ProjectPreview from "./project_preview";
import type { ProjectDTO } from "@/shared/types/database";

interface ProjectListProps {
  projects: ProjectDTO[];
  loading?: boolean;
  savedIds?: Set<string>;
  onToggleSave?: (project: ProjectDTO) => void;
  emptyMessage?: string;
}

export function ProjectList({
  projects,
  loading = false,
  savedIds = new Set(),
  onToggleSave,
  emptyMessage = "Nenhum projeto encontrado com os filtros selecionados.",
}: ProjectListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-44 border border-(--border-subtle) bg-(--surface-1) animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-(--border) text-center w-full">
        <p className="text-(--text-secondary)">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {projects.map((proj) => (
        <ProjectPreview
          key={proj.id}
          project={proj}
          isSaved={savedIds.has(proj.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}
