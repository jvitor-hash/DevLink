import { ULIB } from "@/shared/ui";
import { mapValueLabel } from "@/shared/utils/value_labels";
import { MessageCircle } from "react-feather";

interface ProjectInfoPanelProps {
  project: {
    id?: string;
    title?: string;
    description?: string;
    category?: string;
    sub_category?: string | null;
    status?: string;
    minBudget?: number;
    maxBudget?: number;
    primaryLanguage?: string | null;
    audience?: string | null;
    platforms?: string[] | null;
    deadline?: string | Date | null;
    problem?: string | null;
    user_actions?: string | null;
    affectedUsers?: string | null;
    northQuestion?: string | null;
    hypothesis?: string | null;
    valueProposition?: string | null;
    differentiation?: string | null;
    audiencePainPoints?: string | null;
    audienceAssumptions?: string | null;
    notAudience?: string | null;
    requirements?: string | null;
    successCriteria?: string | null;
    [key: string]: any;
  };
  onOpenChat?: () => void;
}

const formatDeadline = (dateValue: string | Date | null | undefined): string | null => {
  if (!dateValue) return null;
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [y, m, day] = dateValue.split("-");
    return `${day}/${m}/${y}`;
  }
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR");
};

export function ProjectInfoPanel({ project, onOpenChat }: ProjectInfoPanelProps) {
  const formattedDeadline = formatDeadline(project.deadline);

  const hasProblemDetails = Boolean(
    project.problem?.trim() || project.user_actions?.trim() || project.affectedUsers?.trim()
  );
  const hasSolutionDetails = Boolean(
    project.northQuestion?.trim() ||
      project.hypothesis?.trim() ||
      project.valueProposition?.trim() ||
      project.differentiation?.trim()
  );
  const hasAudienceDetails = Boolean(
    project.audiencePainPoints?.trim() ||
      project.notAudience?.trim() ||
      project.audienceAssumptions?.trim()
  );
  const hasExecutionDetails = Boolean(
    project.requirements?.trim() || project.successCriteria?.trim()
  );

  return (
    <div className="flex flex-col gap-6 p-6 border border-(--border) bg-(--surface-1) w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {project.category && (
              <ULIB.badge tone="brand">{mapValueLabel(project.category)}</ULIB.badge>
            )}
            {project.sub_category && (
              <ULIB.badge tone="default">{mapValueLabel(project.sub_category)}</ULIB.badge>
            )}
            {project.status && (
              <ULIB.badge tone="secondary">{mapValueLabel(project.status)}</ULIB.badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-(--text-primary)">{project.title}</h1>
          {project.description && (
            <p className="text-(--text-secondary) leading-relaxed">{project.description}</p>
          )}
        </div>

        {onOpenChat && (
          <ULIB.button
            type="button"
            onClick={onOpenChat}
            className="flex items-center gap-2 px-3.5 py-2 shrink-0 cursor-pointer text-sm font-medium"
            title="Conversar com o criador do projeto"
            aria-label="Conversar com o criador do projeto"
          >
            <MessageCircle size={18} />
            <span>Mensagem</span>
          </ULIB.button>
        )}
      </div>

      {/* Technical & Budget Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-(--border-subtle) bg-(--surface-2)/30">
        <div>
          <span className="text-xs text-(--text-muted) block">Orçamento</span>
          <span className="text-sm font-semibold text-(--success)">
            R$ {project.minBudget?.toLocaleString("pt-BR")} - R$ {project.maxBudget?.toLocaleString("pt-BR")}
          </span>
        </div>
        <div>
          <span className="text-xs text-(--text-muted) block">Linguagem Principal</span>
          <span className="text-sm font-medium">
            {project.primaryLanguage ? mapValueLabel(project.primaryLanguage) : "Não especificada"}
          </span>
        </div>
        <div>
          <span className="text-xs text-(--text-muted) block">Público Principal</span>
          <span className="text-sm font-medium">
            {project.audience ? mapValueLabel(project.audience) : "Não especificado"}
          </span>
        </div>
        {formattedDeadline ? (
          <div>
            <span className="text-xs text-(--text-muted) block">Prazo Desejado</span>
            <span className="text-sm font-medium">{formattedDeadline}</span>
          </div>
        ) : (
          <div>
            <span className="text-xs text-(--text-muted) block">Prazo</span>
            <span className="text-sm font-medium text-(--text-muted)">A combinar</span>
          </div>
        )}
        <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-2 pt-3 border-t border-(--border-subtle)/50">
          <span className="text-xs text-(--text-muted)">Plataformas:</span>
          <div className="flex flex-wrap gap-1">
            {project.platforms && project.platforms.length > 0 ? (
              project.platforms.map((p: string) => (
                <span
                  key={p}
                  className="text-xs px-2 py-0.5 rounded bg-(--surface-1) border border-(--border-subtle)"
                >
                  {mapValueLabel(p)}
                </span>
              ))
            ) : (
              <span className="text-xs text-(--text-muted)">Nenhuma</span>
            )}
          </div>
        </div>
      </div>

      {/* Questionnaire Detailed Sections */}
      {(hasProblemDetails || hasSolutionDetails || hasAudienceDetails || hasExecutionDetails) && (
        <div className="flex flex-col gap-6 border-t border-(--border-subtle) pt-6">
          {/* Step 1: Problem & Scope */}
          {hasProblemDetails && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
                Problema & Contexto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.problem?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Problema a Resolver
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.problem}
                    </p>
                  </div>
                )}
                {project.user_actions?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Ações Esperadas do Usuário
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.user_actions}
                    </p>
                  </div>
                )}
                {project.affectedUsers?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Público Afetado
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.affectedUsers}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Solution & Vision */}
          {hasSolutionDetails && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
                Solução Proposta & Visão
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.northQuestion?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Pergunta Central (North Star)
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.northQuestion}
                    </p>
                  </div>
                )}
                {project.hypothesis?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Hipótese da Solução
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.hypothesis}
                    </p>
                  </div>
                )}
                {project.valueProposition?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Proposta de Valor
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.valueProposition}
                    </p>
                  </div>
                )}
                {project.differentiation?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Diferencial Competitivo
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.differentiation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Audience & Pain Points */}
          {hasAudienceDetails && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
                Público-alvo & Dores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.audiencePainPoints?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Principais Dores do Público
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.audiencePainPoints}
                    </p>
                  </div>
                )}
                {project.notAudience?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Quem NÃO é o público deste projeto
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.notAudience}
                    </p>
                  </div>
                )}
                {project.audienceAssumptions?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Suposições sobre o Público
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.audienceAssumptions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Execution & Requirements */}
          {hasExecutionDetails && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
                Requisitos & Critérios de Sucesso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.requirements?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Requisitos
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.requirements}
                    </p>
                  </div>
                )}
                {project.successCriteria?.trim() && (
                  <div className="p-4 bg-(--surface-2)/20 border border-(--border-subtle)">
                    <h4 className="text-sm font-semibold text-(--text-primary) mb-1.5">
                      Critérios de Sucesso
                    </h4>
                    <p className="text-sm text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {project.successCriteria}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
