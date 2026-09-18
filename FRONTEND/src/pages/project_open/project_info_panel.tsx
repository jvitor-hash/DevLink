import Badge from "@/components/ui/badge_component";
import Button from "@/components/ui/button_component";
import ProjectOwnerActions from "./project_owner_actions";
import { authService } from "@/services/auth_service";
import type { ProjectDTO, ProjectStatus } from "@/lib/types/database";

type ProjectInfoPanelProps = {
  project: ProjectDTO;
  isSaved: boolean;
  saveCount: number;
  onToggleSaved: () => void;
  onProjectUpdated: (project: ProjectDTO) => void;
};

const statusBadgeTypes: Record<ProjectStatus, "success" | "info" | "primary" | "error"> = {
  OPEN: "success",
  NEGOTIATING: "info",
  IN_DEVELOPMENT: "info",
  COMPLETED: "primary",
  CANCELLED: "error",
};

/** Organized single-project view mirroring the ticket card's layout. */
export default function ProjectInfoPanel({ project, isSaved, saveCount, onToggleSaved, onProjectUpdated }: ProjectInfoPanelProps) {
  // Only programmers can save projects; the API enforces this as well.
  const canSave = authService.getCachedUser()?.role === "PROGRAMMER";

  return (
    <article className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <Badge label={project.category} badgeType="primary" />
        <span className="text-sm text-(--text-muted)">
          Prazo: {project.deadline ? String(project.deadline).slice(0, 10) : "Não definido"}
        </span>
      </div>

      {/* Title */}
      <h1 className="mb-4 text-2xl font-bold text-(--text-primary)">{project.title}</h1>

      {/* Problem */}
      <p className="mb-4 leading-relaxed text-(--text-secondary)">
        <em>{project.problem ?? project.description}</em>
      </p>

      {/* Project Information */}
      <ul className="mb-4 list-none p-0 text-sm">
        <li className="flex justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
          <span className="text-(--text-muted)">Público-alvo:</span>
          <span className="text-right font-semibold text-(--text-primary)">{project.audience}</span>
        </li>

        <li className="flex justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
          <span className="text-(--text-muted)">Plataformas:</span>
          <span className="text-right font-semibold text-(--text-primary)">{project.platforms.join(", ")}</span>
        </li>

        <li className="flex justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
          <span className="text-(--text-muted)">Linguagem:</span>
          <span className="text-right font-semibold text-(--text-primary)">{project.primaryLanguage}</span>
        </li>

        <li className="flex items-center justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
          <span className="text-(--text-muted)">Status:</span>
          <Badge label={project.status} badgeType={statusBadgeTypes[project.status]} />
        </li>

        <li className="flex justify-between gap-4 py-2.5">
          <span className="text-(--text-muted)">Orçamento:</span>
          <span className="text-right font-semibold text-(--success)">
            R$ {project.minBudget} - {project.maxBudget}
          </span>
        </li>
      </ul>

      {/* Required Actions */}
      <div className="rounded-lg border border-(--border-subtle) p-4 text-sm bg-(--surface-2)">
        <div className="mb-1 font-bold text-(--text-primary)">Ações requeridas do usuário:</div>
        <div className="text-(--text-secondary)">{project.user_actions ?? "Nenhuma ação definida."}</div>
      </div>

      {/* Description */}
      {project.problem && (
        <div className="mt-4">
          <div className="mb-1 font-bold text-(--text-primary)">Descrição:</div>
          <p className="whitespace-pre-wrap text-(--text-secondary)">{project.description}</p>
        </div>
      )}

      {/* Saved toggle with save count (programmers only) */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-(--text-muted)" data-testid="project-save-count">
          {saveCount} {saveCount === 1 ? "salvamento" : "salvamentos"}
        </span>

        {canSave && (
          <Button
            label={isSaved ? "Salvo" : "Salvar"}
            buttonType="button"
            colorType={isSaved ? "secondary" : "primary"}
            onClick={onToggleSaved}
            dataTestId="project-save-btn"
          />
        )}
      </div>

      {/* Owner-only conclude/review flow */}
      <ProjectOwnerActions project={project} onProjectUpdated={onProjectUpdated} />
    </article>
  );
}
