import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SearchFiltering from "@/features/project/components/search_filtering/filtering_search";
import ProjectPreview from "@/features/project/components/project_preview";
import { useProjects } from "@/features/project/hooks/use_projects";
import type { ProjectFetchListQuery } from "@/features/project/types/project_fetch_list_query";

export default function Projects() {
  const [searchParams] = useSearchParams();

  const query = useMemo<ProjectFetchListQuery>(() => {
    const q: ProjectFetchListQuery = {};
    const queryParam = searchParams.get("q");
    if (queryParam) q.q = queryParam;

    const category = searchParams.get("category");
    if (category && category !== "ALL") q.category = category;

    const subCategory = searchParams.get("sub_category");
    if (subCategory && subCategory !== "ALL") q.sub_category = subCategory;

    const audience = searchParams.get("audience");
    if (audience && audience !== "ALL") q.audience = audience;

    const platforms = searchParams.get("platforms");
    if (platforms && platforms !== "ALL") q.platforms = platforms;

    const status = searchParams.get("status");
    if (status && status !== "ALL") q.status = status;

    const minBudget = searchParams.get("minBudget");
    if (minBudget) q.minBudget = Number(minBudget);

    const maxBudget = searchParams.get("maxBudget");
    if (maxBudget) q.maxBudget = Number(maxBudget);

    return q;
  }, [searchParams]);

  const { projects, loading, error } = useProjects(query);

  return (
    <div className="mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-6 items-start">
      {/* Search and Filters Sidebar */}
      <SearchFiltering />

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between pb-3 border-b border-(--border-subtle)">
          <h1 className="text-xl font-bold text-(--text-primary)">
            Projetos Disponíveis
            {!loading && (
              <span className="ml-2 text-xs font-normal text-(--text-muted)">
                ({projects.length} encontrado{projects.length === 1 ? "" : "s"})
              </span>
            )}
          </h1>
        </div>

        {loading && (
          <div className="p-12 text-center text-sm text-(--text-muted)">
            Carregando projetos...
          </div>
        )}

        {error && !loading && (
          <div className="p-6 text-center text-sm text-(--error) border border-(--error)/30 bg-(--error)/10 rounded-md">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="p-12 text-center text-sm text-(--text-muted) italic border border-dashed border-(--border-subtle) rounded-md">
            Nenhum projeto encontrado com os filtros selecionados.
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectPreview key={project.id} {...project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
