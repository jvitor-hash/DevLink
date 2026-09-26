import Badge from "@/components/ui/badge_component";
import { mapValueLabel } from "@/data/value_labels";
import { userSingleton } from "@/context/user";
import type { ProjectDTO, ProjectStatus } from "@/data/types/database";
import { Bookmark, Calendar, MessageCircle, MoreVertical } from "react-feather";

type ProjectInfoPanelProps = {
  project: ProjectDTO;
  isSaved: boolean;
  saveCount?: number;
  onToggleSaved: () => void;
  onProjectUpdated: (project: ProjectDTO) => void;
  onOpenChat: () => void;
};

const statusBadgeTypes: Record<ProjectStatus, "success" | "info" | "primary" | "error"> = {
  OPEN: "success",
  NEGOTIATING: "info",
  IN_DEVELOPMENT: "info",
  COMPLETED: "primary",
  CANCELLED: "error",
};

// Concluded projects cannot be saved (API rejects them as well).
const isConcluded = (status: ProjectStatus): boolean => status === "COMPLETED" || status === "CANCELLED";

const formatCurrency = (value: number): string => {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function ProjectInfoPanel({ project, isSaved, onToggleSaved, onOpenChat }: ProjectInfoPanelProps) {
  const concluded = isConcluded(project.status);

  // Saving is a programmer-only action; hide the control from everyone else.
  const canSave = userSingleton.getCachedUser()?.role === "PROGRAMMER";

  return (
    <article className="h-full overflow-y-auto rounded-md border border-(--border-subtle) bg-(--surface-1) p-6">
      {/* Header */}
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex gap-2">
          <Badge label={mapValueLabel(project.category)} badgeType="primary" />

          <div className="flex items-center gap-2 text-sm text-(--text-muted)">
            <Calendar size={16} />
            Prazo: {project.deadline ? String(project.deadline).slice(0, 10) : "Não definido"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canSave && (
            <button
              type="button"
              onClick={concluded ? undefined : onToggleSaved}
              disabled={concluded}
              aria-label={isSaved ? "Remover dos salvos" : "Salvar projeto"}
              title={concluded ? "Projetos concluídos não podem ser salvos" : undefined}
              data-testid="save-project-btn"
              className={`flex items-center gap-1 rounded-md border border-(--border-subtle)
              px-2 py-2 text-sm transition-colors hover:bg-(--surface-2) hover:border-(--text-primary) ${
                concluded ? "cursor-not-allowed opacity-50" : "hover:cursor-pointer"
              }`}
            >
              <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} color="var(--text-primary)" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenChat}
            aria-label="chat"
            data-testid="open-chat-btn"
            className="rounded-md border border-(--border-subtle) px-2 py-2
            hover:cursor-pointer hover:bg-(--surface-2) transition-colors hover:border-(--text-primary)"
          >
            <MessageCircle size={16} color="var(--text-primary)" />
          </button>

          <button
            type="button"
            aria-label="Mais opções"
            className="border rounded-md border-(--border-subtle) px-2 py-2
            hover:cursor-pointer hover:bg-(--surface-2) transition-colors hover:border-(--text-primary)"
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
      <ul className="mb-4 list-none p-0 text-sm">
        <li className="flex justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
          <span className="text-(--text-muted)">Público-alvo:</span>
          <span className="text-right font-semibold text-(--text-primary)">{mapValueLabel(project.audience)}</span>
        </li>

        <li className="flex justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
          <span className="text-(--text-muted)">Plataformas:</span>
          <span className="text-right font-semibold text-(--text-primary)">{project.platforms.map(mapValueLabel).join(", ")}</span>
        </li>

        <li className="flex justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
          <span className="text-(--text-muted)">Linguagem:</span>
          <span className="text-right font-semibold text-(--text-primary)">{mapValueLabel(project.primaryLanguage)}</span>
        </li>

        <li className="flex items-center justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
          <span className="text-(--text-muted)">Status:</span>
          <Badge label={mapValueLabel(project.status)} badgeType={statusBadgeTypes[project.status]} />
        </li>

        <li className="flex justify-between gap-4 py-2.5">
          <span className="text-(--text-muted)">Orçamento:</span>
          <span className="text-right font-semibold text-(--success)">
            R$ {formatCurrency(project.minBudget)} - {formatCurrency(project.maxBudget)}
          </span>
        </li>
      </ul>

      {/* Required Actions */}
      <div className="rounded-sm border border-(--border-subtle) p-4 text-sm bg-(--surface-2)">
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
