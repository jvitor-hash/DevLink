import { useState } from "react";
import ChatModal from "@/components/chat/chat_modal";
import { MOCK_CURRENT_USER } from "@/data/chat/mock_chat_data";
import Badge from "@/components/ui/badge_component";
import { mapValueLabel } from "@/data/value_labels";
import type { ProjectDTO, ProjectStatus } from "@/data/types/database";
import { Calendar, MessageCircle, MoreVertical } from "react-feather";

type ProjectInfoPanelProps = {
  project: ProjectDTO;
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

export default function ProjectInfoPanel({ project }: ProjectInfoPanelProps) {
  const [showChat, setShowChat] = useState<boolean>(false);

  return (
    <article className="gb-glass h-full overflow-y-auto p-4 sm:p-6">
      {/* Header */}
      <header className="mb-4 flex items-start justify-between gap-3 pb-3">
        <div className="flex gap-2">
          <Badge label={mapValueLabel(project.category)} badgeType="primary" />

          <div className="flex items-center gap-2 text-sm text-(--text-muted)">
            <Calendar size={16} />
            Prazo: {project.deadline ? String(project.deadline).slice(0, 10) : "Não definido"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Mais opções"
            className="border rounded-md border-(--border-subtle) px-2 py-2
            hover:cursor-pointer hover:bg-(--surface-2) transition-colors hover:border-(--text-primary)"
          >
            <MoreVertical size={16} color="var(--text-primary)" />
          </button>

          <button
            type="button"
            aria-label="Histórico de conversa"
            onClick={() => setShowChat(true)}
            className="border rounded-md border-(--border-subtle) px-2 py-2
            hover:cursor-pointer hover:bg-(--surface-2) transition-colors hover:border-(--text-primary)"
          >
            <MessageCircle size={16} color="var(--text-primary)" />
          </button>
        </div>
      </header>

      {/* Title */}
      <h1 className="gb-heading mb-4 text-3xl tracking-tight">{project.title}</h1>

      {/* Problem */}
      <p className="mb-4 leading-relaxed text-(--text-secondary)">
        <em>{project.problem ?? project.description}</em>
      </p>

      {/* Project Information */}
      <ul className="mb-4 list-none p-0 text-sm">
        <li className="flex justify-between gap-4 py-2.5">
          <span className="gb-label text-(--gb-stone-400)">PÚBLICO-ALVO:</span>
          <span className="text-right font-bold">{mapValueLabel(project.audience)}</span>
        </li>

        <li className="flex justify-between gap-4 py-2.5">
          <span className="gb-label text-(--gb-stone-400)">PLATAFORMAS:</span>
          <span className="text-right font-bold">{project.platforms.map(mapValueLabel).join(", ")}</span>
        </li>

        <li className="flex justify-between gap-4 py-2.5">
          <span className="gb-label text-(--gb-stone-400)">LINGUAGEM:</span>
          <span className="text-right font-bold">{mapValueLabel(project.primaryLanguage)}</span>
        </li>

        <li className="flex items-center justify-between gap-4 py-2.5">
          <span className="gb-label text-(--gb-stone-400)">STATUS:</span>
          <Badge label={mapValueLabel(project.status)} badgeType={statusBadgeTypes[project.status]} />
        </li>

        <li className="flex justify-between gap-4 py-2.5">
          <span className="gb-label text-(--gb-stone-400)">ORÇAMENTO:</span>
          <span className="text-right font-bold text-(--primary)">
            R$ {formatCurrency(project.minBudget)} - {formatCurrency(project.maxBudget)}
          </span>
        </li>
      </ul>

      {/* Required Actions */}
      <div className="mt-4">
        <div className="gb-label mb-1 font-bold">AÇÕES REQUERIDAS DO USUÁRIO:</div>
        <div className="text-sm">{project.user_actions ?? "Nenhuma ação definida."}</div>
      </div>

      {/* Description */}
      {project.problem && (
        <div className="mt-4">
          <div className="gb-label mb-1 font-bold">DESCRIÇÃO DO PROJETO:</div>
          <p className="whitespace-pre-wrap text-sm">{project.description}</p>
        </div>
      )}

      <ChatModal open={showChat} onClose={() => setShowChat(false)} currentUser={MOCK_CURRENT_USER} />
    </article>
  );
}
