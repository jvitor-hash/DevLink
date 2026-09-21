import Badge from "@/components/ui/badge_component";
import type { ProjectDTO, ProjectStatus } from "@/lib/types/database";
import { Bookmark, Calendar, MoreVertical } from "react-feather";

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

const formatCurrency = (value: number): string => {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function ProjectInfoPanel({ project, isSaved, saveCount, onToggleSaved }: ProjectInfoPanelProps) {
  return (
    <article className="h-full overflow-y-auto rounded-md border border-(--border-subtle) bg-(--surface-1) p-6">
      {/* Header */}
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Badge label={project.category} badgeType="primary" />

          <div className="flex items-center gap-2 text-sm text-(--text-muted)">
            <Calendar size={14} />
            Prazo: {project.deadline ? String(project.deadline).slice(0, 10) : "Não definido"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSaved}
            aria-label={isSaved ? "Remover dos salvos" : "Salvar projeto"}
            data-testid="save-project-btn"
            className="flex items-center gap-1 rounded-md border border-(--border-subtle) px-2 py-1 text-sm text-(--text-primary) transition-colors hover:cursor-pointer hover:bg-(--surface-2)"
          >
            <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
            {saveCount}
          </button>

          <button
            type="button"
            aria-label="Mais opções"
            className="grid h-8 w-8 place-items-center rounded-full hover:cursor-pointer hover:bg-(--surface-2)"
          >
            <MoreVertical size={16} color="var(--text-primary)" />
          </button>
        </div>
      </header>

      {/* Title */}
      <h1 className="mb-4 text-2xl font-bold text-(--text-primary)">{project.title}</h1>

      {/* Problem */}
      <p className="mb-4 leading-relaxed text-(--text-secondary)">
        <em>{project.problem ?? project.description}</em>
      </p>

      {/* Project Information */}
      <ul className="mb-4 max-w-fit list-none p-0 text-sm">
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
            R$ {formatCurrency(project.minBudget)} - {formatCurrency(project.maxBudget)}
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
          <div className="mb-1 font-bold text-(--text-primary)">Descrição do projeto:</div>
          <p className="whitespace-pre-wrap text-(--text-secondary)">{project.description}</p>
        </div>
      )}
    </article>
  );
}
