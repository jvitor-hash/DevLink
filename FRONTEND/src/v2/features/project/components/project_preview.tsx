import { ULIB } from "@/shared/ui";
import { useRedirect } from "@/shared/hooks/use_redirect";
import { mapValueLabel } from "@/shared/utils/value_labels";
import { Bookmark } from "react-feather";
import type { ProjectDTO } from "@/shared/types/database";

export interface ProjectPreviewProps {
    project: ProjectDTO;
    isSaved?: boolean;
    onToggleSave?: (project: ProjectDTO) => void;
}

export default function ProjectPreview({ project, isSaved = false, onToggleSave }: ProjectPreviewProps) {
    const redirect = useRedirect();

    const handleCardClick = () => {
        redirect(`/project/open/${project.id}`);
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSave?.(project);
    };

    return (
        <ULIB.card className="p-4 border border-(--border) hover:border-(--primary)/50 cursor-pointer transition-all flex flex-col justify-between gap-3">
            <div onClick={handleCardClick} className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg text-(--text-primary) line-clamp-1">{project.title}</h3>
                    {onToggleSave && (
                        <button
                            type="button"
                            onClick={handleSaveClick}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                                isSaved
                                    ? "text-(--primary) bg-(--primary)/10"
                                    : "text-(--text-muted) hover:text-(--text-primary)"
                            }`}
                            aria-label={isSaved ? "Remover dos favoritos" : "Salvar projeto"}
                        >
                            <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                    )}
                </div>

                <p className="text-sm text-(--text-secondary) line-clamp-2">{project.description}</p>

                <div className="flex flex-wrap gap-1.5 mt-1">
                    <ULIB.badge tone="brand">{mapValueLabel(project.category)}</ULIB.badge>
                    {project.sub_category && (
                        <ULIB.badge tone="default">{mapValueLabel(project.sub_category)}</ULIB.badge>
                    )}
                    <ULIB.badge tone="secondary">{mapValueLabel(project.status)}</ULIB.badge>
                    {project.platforms?.map((plat) => (
                        <span key={plat} className="text-xs px-2 py-0.5 rounded bg-(--surface-2) text-(--text-muted)">
                            {mapValueLabel(plat)}
                        </span>
                    ))}
                </div>
            </div>

            <div onClick={handleCardClick} className="flex items-center justify-between pt-2 border-t border-(--border-subtle) text-sm">
                <span className="text-(--text-muted)">Orçamento:</span>
                <span className="font-medium text-(--success)">
                    R$ {project.minBudget.toLocaleString("pt-BR")} - R$ {project.maxBudget.toLocaleString("pt-BR")}
                </span>
            </div>
        </ULIB.card>
    );
}
