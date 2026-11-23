import { ULIB } from "@/shared/ui";
import { mapValueLabel } from "@/shared/utils/value_labels";
import type { ProjectDTO } from "@/shared/types/database";

interface ProjectInfoPanelProps {
  project: ProjectDTO;
}

export function ProjectInfoPanel({ project }: ProjectInfoPanelProps) {
  return (
    <div className="flex flex-col gap-6 p-6 border border-(--border) bg-(--surface-1) rounded-md w-full">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ULIB.badge tone="brand">{mapValueLabel(project.category)}</ULIB.badge>
          {project.sub_category && (
            <ULIB.badge tone="default">{mapValueLabel(project.sub_category)}</ULIB.badge>
          )}
          <ULIB.badge tone="secondary">{mapValueLabel(project.status)}</ULIB.badge>
        </div>

        <h1 className="text-2xl font-bold text-(--text-primary)">{project.title}</h1>
        <p className="text-(--text-secondary) leading-relaxed">{project.description}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-(--border-subtle) bg-(--surface-2)/30 rounded-md">
        <div>
          <span className="text-xs text-(--text-muted) block">Orçamento</span>
          <span className="text-sm font-semibold text-(--success)">
            R$ {project.minBudget.toLocaleString()} - {project.maxBudget.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-xs text-(--text-muted) block">Linguagem Principal</span>
          <span className="text-sm font-medium">{mapValueLabel(project.primaryLanguage)}</span>
        </div>
        <div>
          <span className="text-xs text-(--text-muted) block">Público-alvo</span>
          <span className="text-sm font-medium">{mapValueLabel(project.audience)}</span>
        </div>
        <div>
          <span className="text-xs text-(--text-muted) block">Plataformas</span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {project.platforms?.map((p) => (
              <span key={p} className="text-xs px-1.5 py-0.5 rounded bg-(--surface-1) border border-(--border-subtle)">
                {mapValueLabel(p)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {(project.problem || project.requirements || project.successCriteria) && (
        <div className="flex flex-col gap-4 border-t border-(--border-subtle) pt-4">
          {project.problem && (
            <div>
              <h4 className="text-sm font-semibold text-(--text-primary) mb-1">Problema a resolver:</h4>
              <p className="text-sm text-(--text-secondary)">{project.problem}</p>
            </div>
          )}

          {project.requirements && (
            <div>
              <h4 className="text-sm font-semibold text-(--text-primary) mb-1">Requisitos:</h4>
              <p className="text-sm text-(--text-secondary)">{project.requirements}</p>
            </div>
          )}

          {project.successCriteria && (
            <div>
              <h4 className="text-sm font-semibold text-(--text-primary) mb-1">Critérios de Sucesso:</h4>
              <p className="text-sm text-(--text-secondary)">{project.successCriteria}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
