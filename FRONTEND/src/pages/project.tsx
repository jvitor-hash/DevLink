import ProfileCard from "@/components/layout/profile_card_layout";
import SearchFiltersLayout from "@/components/layout/search_filters_layout";
import { EMPTY_FILTERS, HIDDEN_PROJECT_STATUSES, type ProjectFilters } from "@/lib/types/project_filters";
import Input from "@/components/ui/input_component";
import ProjectPreview from "@/components/ui/project_ticket_component";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight } from "react-feather";
import { type ProjectDTO, type ListParams, type PublicUserDTO } from "@/lib/types/database";
import { projectService } from "@/services/project_service";
import { userService } from "@/services/user_service";
import { useSavedTickets } from "@/lib/hooks/use_saved_tickets";
import { ActiveFiltersBanner } from "../components/layout/active_filters_banner";
import Button from "@/components/ui/button_component";

const PAGE_SIZE = 10;

const filtersFromUrl = (searchParams: URLSearchParams): ProjectFilters => ({
  ...EMPTY_FILTERS,
  category: searchParams.get("category") ?? "ALL",
  sub_category: searchParams.get("sub_category") ?? "ALL",
  q: searchParams.get("q") ?? "",
  audience: (searchParams.get("audience") ?? "ALL") as ProjectFilters["audience"],
  platforms: (searchParams.get("platforms") ?? "ALL") as ProjectFilters["platforms"],
  primaryLanguage: (searchParams.get("primaryLanguage") ?? "ALL") as ProjectFilters["primaryLanguage"],
  status: (searchParams.get("status") ?? "ALL") as ProjectFilters["status"],
  minBudget: searchParams.get("minBudget") ?? "",
  maxBudget: searchParams.get("maxBudget") ?? "",
});

const buildFilterQuery = (filters: ProjectFilters): string => {
  const params = new URLSearchParams();

  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.category !== "ALL") params.set("category", filters.category);
  if (filters.sub_category !== "ALL") params.set("sub_category", filters.sub_category);
  if (filters.audience !== "ALL") params.set("audience", filters.audience);
  if (filters.platforms !== "ALL") params.set("platforms", filters.platforms);
  if (filters.primaryLanguage !== "ALL") params.set("primaryLanguage", filters.primaryLanguage);
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.minBudget) params.set("minBudget", filters.minBudget);
  if (filters.maxBudget) params.set("maxBudget", filters.maxBudget);

  return params.toString();
};

const buildListParams = (filters: ProjectFilters) : ListParams => {
  const params: ListParams = {
    // Server-side exclusion keeps pagination accurate; these projects never list.
    excludeStatuses: HIDDEN_PROJECT_STATUSES,
  };

  if (filters.q && filters.q.trim() !== "") params.q = filters.q.trim();
  if (filters.category !== "ALL") params.category = filters.category;
  if (filters.sub_category !== "ALL") params.sub_category = filters.sub_category;
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.toString();

  // URL is the source of truth for category/sub_category deep links; the
  // rest of the filters stay user-managed state.
  const urlFilters = useMemo(
    () => filtersFromUrl(searchParams),
    [urlQuery],
  );

  // Snapshot of the filters behind the currently displayed results.
  const [appliedFilters, setAppliedFilters] = useState<ProjectFilters>(urlFilters);

  // URL deep links re-apply immediately; adjust during render instead of in an effect.
  const [lastUrlFilters, setLastUrlFilters] = useState(urlFilters);

  if (urlFilters !== lastUrlFilters) {
    setLastUrlFilters(urlFilters);
    setAppliedFilters(urlFilters);
  }

  const { saveCounts, isSaved, toggleSaved, setSaveCountsFromProjects } = useSavedTickets();

  // Prominent clients load once; state updates happen in async callbacks to keep the effect clean.
  useEffect(() => {
    let cancelled = false;

    userService.getProminentClients()
      .catch(() : PublicUserDTO[] => [])
      .then((clients) => {
        if (!cancelled) setProminentClients(clients);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Projects reload whenever the URL filter params changes.
  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);

    projectService.list({ limit: PAGE_SIZE, ...buildListParams(urlFilters) })
      .then((projectList) => {
        if (cancelled) return;

        setProjects(projectList);
        setSaveCountsFromProjects(projectList);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;

        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os projetos.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
  }, [urlQuery, urlFilters, setSaveCountsFromProjects]);

  const currentFilters: ProjectFilters = {
    ...filters,
    category: urlFilters.category,
    sub_category: urlFilters.sub_category,
  };

  // Only pending when the standby filters would query something different.
  const hasPendingFilters : boolean =
    JSON.stringify(buildListParams(currentFilters)) !== JSON.stringify(buildListParams(appliedFilters));

  const handleSearch = (): void => {
    const query = buildFilterQuery(currentFilters);

    navigate(query ? `/project?${query}` : "/project");
  };

  // Filter edits stay on standby in local state; only "Pesquisar" applies them.
  const handleFilterChange = (next: ProjectFilters) : void => {
    setFilters({
      ...next,
      category: urlFilters.category,
      sub_category: urlFilters.sub_category,
    });
  };

  return (
    <>
      <section>
        <form className="relative mx-25 max-h-fit" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <Input
            icon="search"
            label=""
            name="searchQuery"
            inputType="text"
            placeholder="Busque por novos projetos ou usuarios..."
            value={currentFilters.q}
            onChange={(e) => handleFilterChange({ ...currentFilters, q: e.target.value })}
          />
          <div className="absolute right-2 top-8 -translate-y-1/2 flex gap-2">
            {hasPendingFilters && (
              <button
                type="button"
                data-testid="pending-filters-indicator"
                className="self-center rounded-full bg-(--warning) px-3 py-1 text-xs text-white hover:cursor-pointer"
                onClick={handleSearch}
              >
                Filtros não aplicados
              </button>
            )}
            <Button label="Pesquisar" buttonType="submit"/>
          </div>

          <SearchFiltersLayout value={currentFilters} onChange={handleFilterChange} />
        </form>
      </section>

      <section className="mx-25">
        <ActiveFiltersBanner filters={urlFilters} />

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
      </section>      </>
  );
}
