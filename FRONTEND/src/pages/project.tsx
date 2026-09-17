import { ProjectModal } from "@/components/layout/project_modal_layout";
import ProfileCard from "@/components/layout/profile_card_layout";
import SearchFiltersLayout from "@/components/layout/search_filters_layout";
import { EMPTY_FILTERS, type ProjectFilters } from "@/lib/types/project_filters";
import Button from "@/components/ui/button_component";
import Input from "@/components/ui/input_component";
import ProjectPreview from "@/components/ui/project_ticket_component";
import { Suspense, useEffect, useState } from "react";
import { ChevronRight } from "react-feather";
import { type ProjectDTO, type ListParams, type PublicUserDTO } from "@/lib/types/database";
import { projectService } from "@/services/project_service";
import { userService } from "@/services/user_service";
import { useSavedTickets } from "@/lib/hooks/use_saved_tickets";

const PAGE_SIZE = 10;

const buildListParams = (filters: ProjectFilters) : ListParams => {
  const params: ListParams = {};

  if (filters.audience !== "ALL") params.audience = filters.audience;
  if (filters.platforms !== "ALL") params.platforms = [filters.platforms];
  if (filters.primaryLanguage !== "ALL") params.primaryLanguage = filters.primaryLanguage;
  if (filters.status !== "ALL") params.status = filters.status;

  if (filters.minBudget !== "") {
    const minBudget = Number(filters.minBudget);

    if (Number.isFinite(minBudget)) params.minBudget = minBudget;
  }

  if (filters.maxBudget !== "") {
    const maxBudget = Number(filters.maxBudget);

    if (Number.isFinite(maxBudget)) params.maxBudget = maxBudget;
  }

  return params;
};

export default function ProjectPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectDTO[] | null>(null);
  const [prominentClients, setProminentClients] = useState<PublicUserDTO[] | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>(EMPTY_FILTERS);

  const { saveCounts, isSaved, toggleSaved, setSaveCountsFromProjects } = useSavedTickets();

  const loadProjects = async (params: ListParams = {}) : Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.list({ limit: PAGE_SIZE, ...params });

      setProjects(result);
      setSaveCountsFromProjects(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os projetos.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load; state updates happen in async callbacks to keep the effect clean.
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      projectService.list({ limit: PAGE_SIZE }),
      userService.getProminentClients().catch(() : PublicUserDTO[] => []),
    ])
      .then(([projectList, clients]) => {
        if (cancelled) return;

        setProjects(projectList);
        setSaveCountsFromProjects(projectList);
        setProminentClients(clients);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;

        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os projetos.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setSaveCountsFromProjects]);

  const handleSearch = () : void => {
    void loadProjects(buildListParams(filters));
  };

  const handleFilterChange = (next: ProjectFilters) : void => {
    setFilters(next);

    void loadProjects(buildListParams(next));
  };

  return (
    <>
      <section>
        <form className="relative mx-25 max-h-fit" onSubmit={(e) => e.preventDefault()}>
          <Input icon="search" label="" name="searchQuery" inputType="text" placeholder="Busque por novos projetos ou usuarios..." />
          <div className="absolute right-2 top-8 -translate-y-1/2 flex gap-2">
            <Button label="Pesquisar" buttonType="button" onClick={handleSearch} />
          </div>

          <SearchFiltersLayout value={filters} onChange={handleFilterChange} />
        </form>
      </section>

      <section className="mx-25">
        <div className="mb-5 mt-5">
          <div className="flex justify-between">
            <h1 className="text-2xl text-(--text-primary) mb-3"><span className="text-white text-3xl">*</span>Highlights desta semana:</h1>
            <button className="group flex items-center hover:cursor-pointer">Ver mais<ChevronRight className="inline transition-all group-hover:mx-2" /></button>
          </div>
          <div className="border-b border-b-(--error)"></div>
        </div>

        <div className="grid">
          {isLoading && !projects ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="text-(--error)">{error}</p>
          ) : projects && projects.length ? (
            projects.map((project) => (
              <ProjectPreview
                key={project.id}
                item={project.id}
                title={project.title}
                category={project.category}
                deadline={project.deadline ? String(project.deadline).slice(0, 10) : (project.completedAt ?? "")}
                problem={project.problem ?? ""}
                actions={project.user_actions ?? ""}
                audience={project.audience}
                programming_language={project.primaryLanguage}
                platforms={project.platforms}
                status={project.status}
                maxBudget={project.maxBudget}
                minBudget={project.minBudget}
                saved={isSaved(project.id)}
                saveCount={saveCounts[project.id] ?? project.saveTotalCount ?? 0}
                onToggleSaved={() => toggleSaved(project.id)}
              />
            ))
          ) : (
            <p className="text-(--text-muted)">Nenhum projeto encontrado.</p>
          )}
        </div>
      </section>

      {/* Prominent clients */}
      <section className="mx-25 mt-8">
        <div className="flex justify-between">
          <h2 className="text-2xl">Clientes em destaque:</h2>
          <button className="group flex items-center hover:cursor-pointer">Ver mais<ChevronRight className="inline transition-all group-hover:mx-2" /></button>
        </div>
        <div className="border-b border-b-(--error) mt-3 mb-3"></div>
        <div className="flex gap-4 flex-wrap">
          {!prominentClients || prominentClients.length === 0 ? (
            <p className="text-sm text-(--text-muted)">Nenhum cliente em destaque.</p>
          ) : (
            prominentClients.map((client) => (
              <ProfileCard
                key={client.id}
                name={client.name}
                bio={client.bio}
                role={client.role ?? "CLIENT"}
                onClick={() => {
                  window.location.href = `/profile/${client.id}`;
                }}
              />
            ))
          )}
        </div>
      </section>

      <Suspense fallback={null}>
        <ProjectModal />
      </Suspense>
    </>
  );
}
