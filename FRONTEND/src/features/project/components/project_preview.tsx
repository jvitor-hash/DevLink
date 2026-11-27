import { ULIB } from "@/shared/ui";
import { useRedirect } from "@/shared/hooks/use_redirect";

export default function ProjectPreview(project) {
    const redirect = useRedirect();

    return (
        <ULIB.card className="p-4 border border-(--border) hover:border-(--primary)/50 cursor-pointer" onClick={() => redirect(`/project/open/${project.id}`)}>
            <div  className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg text-(--text-primary) line-clamp-1">{project.title}</h3>
                </div>
                <p className="text-sm text-(--text-secondary) line-clamp-2">{project.description}</p>
            </div>

            <div className="mt-1">
                <ul className="flex flex-col gap-1.5">
                    <li className="flex justify-between border-b border-(--border-subtle)">
                        <span className="text-(--text-muted)">Categoria: </span>
                        <span className="text-(--text-primary)">{project.category}</span>
                    </li>
                    <li className="flex justify-between border-b border-(--border-subtle)">
                        <span className="text-(--text-muted)">Sub-Categoria: </span>
                        <span className="text-(--text-primary)">{project.sub_category}</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-(--text-muted)">Status: </span>
                        <span className="text-(--text-primary)">{project.status}</span>
                    </li>
                </ul>
            </div>

            <div>
                <span className="text-xs px-2 py-0.5 bg-(--surface-2) text-(--text-muted)">
                    {project.platforms.join(", ")}
                </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-(--border-subtle) text-sm">
                <span className="text-(--text-muted)">Orçamento:</span>
                <span className="font-medium text-(--success)">
                    R$ {project.minBudget.toLocaleString("pt-BR")} - R$ {project.maxBudget.toLocaleString("pt-BR")}
                </span>
            </div>
        </ULIB.card>
    );
}
