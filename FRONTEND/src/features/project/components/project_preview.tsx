import { ULIB } from "@/shared/ui";
import { useRedirect } from "@/shared/hooks/use_redirect";

export default function ProjectPreview(project) {
    const redirect = useRedirect();

    return (
        <ULIB.card3D 
            className="p-4 border border-(--border) hover:border-(--primary)/50 cursor-pointer transition-all flex flex-col justify-between gap-3"
        >
            <div onClick={() => redirect(`/project/open/${project.id}`)} className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg text-(--text-primary) line-clamp-1">{project.title}</h3>
                </div>
                <p className="text-sm text-(--text-secondary) line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                    <ULIB.badge tone="brand">{project.category}</ULIB.badge>
                    <ULIB.badge tone="default">{project.sub_category}</ULIB.badge>
                    <ULIB.badge tone="secondary">{project.status}</ULIB.badge>
                    <span className="text-xs px-2 py-0.5 bg-(--surface-2) text-(--text-muted)">
                        {project.platforms.join(", ")}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-(--border-subtle) text-sm">
                <span className="text-(--text-muted)">Orçamento:</span>
                <span className="font-medium text-(--success)">
                    R$ {project.minBudget.toLocaleString("pt-BR")} - R$ {project.maxBudget.toLocaleString("pt-BR")}
                </span>
            </div>
        </ULIB.card3D>
    );
}
