import { useNavigate } from 'react-router-dom';
import { Card3D } from "./3d_card_component";
import Badge from "./badge_componen";

import type { Audience, ProjectStatus } from "@/lib/types/database";

type ProjectPreviewProps = {
  item: string
  title: string
  category: string
  deadline: string
  problem: string
  audience: Audience
  platforms: string[]
  status: ProjectStatus
  actions: string
  programming_language: string
  minBudget: number
  maxBudget: number
}

export default function ProjectPreview({ item, title, category, deadline, problem, audience, platforms, status, actions, programming_language, minBudget, maxBudget }: ProjectPreviewProps) {
  const navigate = useNavigate();
  const openModal = () => {
    navigate(`?modal=project&id=${encodeURIComponent(item)}`);
  };

  return (
    <Card3D className="w-full max-w-90 shadow-sm hover:shadow-lg" onClick={openModal}>
      <div
        className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-1)"
        style={{ boxShadow: "0 0.25rem 0.75rem rgba(0, 0, 0, 0.25)" }}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between gap-3">
            <Badge label={category} badgeType="primary" />
            <span id="preview-deadline" className="text-sm text-(--text-muted)">Prazo: {deadline}</span>
          </div>

          {/* Title */}
          <h5 id="preview-title" className="mb-4 text-xl font-bold text-(--text-primary)">{title}</h5>

          {/* Problem */}
          <p id="preview-problem" className="mb-4 leading-relaxed text-(--text-secondary)">
            <em>
              {problem}
            </em>
          </p>

          {/* Project Information */}
          <ul className="mb-4 list-none p-0 text-sm">
            <li className="flex justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
              <span className="text-(--text-muted)">Público-alvo:</span>
              <span id="preview-public" className="text-right font-semibold text-(--text-primary)">
                {audience}
              </span>
            </li>

            <li className="flex justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
              <span className="text-(--text-muted)">Plataformas:</span>
              <span id="preview-platforms" className="text-right font-semibold text-(--text-primary)">
                {platforms.map((platform, index) => (
                  index !== platforms.length - 1 ? `${platform}, ` : ` ${platform}`
                ))}
              </span>
            </li>

            <li className="flex justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
              <span className="text-(--text-muted)">Linguagem:</span>
              <span id="preview-language" className="text-right font-semibold text-(--text-primary)">
                {programming_language}
              </span>
            </li>

            <li className="flex justify-between gap-4 border-b py-2.5 border-b-(--border-subtle)">
              <span className="text-(--text-muted)">Status:</span>
              <span id="preview-language" className="text-right font-semibold text-(--text-primary)">
                {status}
              </span>
            </li>

            <li className="flex justify-between gap-4 py-2.5">
              <span className="text-(--text-muted)">Orçamento:</span>
              <span id="preview-budget" className="text-right font-semibold text-(--success)">
                R$ {minBudget} - {maxBudget}
              </span>
            </li>
          </ul>

          {/* Required Actions */}
          <div className="rounded-lg border border-(--border-subtle) p-4 text-sm bg-(--surface-2)">
            <div className="mb-1 font-bold text-(--text-primary)">
              Ações requeridas do usuário:
            </div>
            <div id="preview-actions text-(--text-secondary)">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </Card3D>
  );
}
