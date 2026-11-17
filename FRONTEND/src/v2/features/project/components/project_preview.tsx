import { ULIB } from "@/shared/ui";
import { useRedirect } from "@/v2/shared/hooks/use_redirect";
import type { ProjectPreviewData } from "../types/project_preview_type";

export default function ProjectPreview(data: ProjectPreviewData) {
    const redirect = useRedirect();
    return (
        <>
            <ULIB.card3D className="border border-(--border) p-4" onClick={() => redirect(data.url)}>
                <div className="flex flex-col gap-2">
                    <h3>{data.title}</h3>
                    <p className="bg-(--">{data.category}</p>
                    <p>{data.subCategory}</p>
                    <p>{data.public}</p>
                    <p>{data.platform}</p>
                    <p>{data.status}</p>
                    <div className="flex gap-2">
                        <p className="color-(--success)">$</p>
                        <p>{data.minBudget}</p>
                        <p>{data.maxBudget}</p>
                    </div>
                </div>
            </ULIB.card3D>
        </>
    );
}