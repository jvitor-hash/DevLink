import SearchFiltersLayout from "@/components/ui/search_filters";
import { EMPTY_FILTERS, HIDDEN_PROJECT_STATUSES, type ProjectFilters } from "@/data/types/project_filters";
import Input from "@/components/form/input_component";
import ProjectPreview from "@/components/ui/project_ticket_component";
import { useMemo, useState } from "react";
import { useLoaderData, useNavigate, useSearchParams, type LoaderFunctionArgs } from "react-router-dom";
import { type ProjectDTO, type ListParams } from "@/data/types/database";
import { projectService } from "@/data/services/project_service";
import { ActiveFiltersBanner } from "@/components/ui/active_filters_banner";
import Button from "@/components/ui/button_component";

const PAGE_SIZE = 10;

type ProjectListData = {
  projects: ProjectDTO[];
  page: number;
  hasNextPage: boolean;
};

const readPage = (searchParams: URLSearchParams): number => {
  const raw = Number(searchParams.get("page") ?? "1");

  return Number.isInteger(raw) && raw > 0 ? raw : 1;
};

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
  if (filters.sub_category !== "ALL")
    params.set("sub_category", filters.sub_category);
  if (filters.audience !== "ALL") params.set("audience", filters.audience);
  if (filters.platforms !== "ALL") params.set("platforms", filters.platforms);
  if (filters.primaryLanguage !== "ALL")
    params.set("primaryLanguage", filters.primaryLanguage);
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.minBudget) params.set("minBudget", filters.minBudget);
  if (filters.maxBudget) params.set("maxBudget", filters.maxBudget);

  return params.toString();
};

const buildListParams = (filters: ProjectFilters): ListParams => {
  const params: ListParams = {
    // Server-side exclusion keeps pagination accurate; these projects never list.
    excludeStatuses: HIDDEN_PROJECT_STATUSES,
  };

  if (filters.q && filters.q.trim() !== "") params.q = filters.q.trim();
  if (filters.category !== "ALL") params.category = filters.category;
  if (filters.sub_category !== "ALL")
    params.sub_category = filters.sub_category;
  if (filters.audience !== "ALL") params.audience = filters.audience;
  if (filters.platforms !== "ALL") params.platforms = [filters.platforms];
  if (filters.primaryLanguage !== "ALL")
    params.primaryLanguage = filters.primaryLanguage;
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

export async function ProjectLoader({ request }: LoaderFunctionArgs): Promise<ProjectListData> {
  const searchParams = new URL(request.url).searchParams;
  const filters = filtersFromUrl(searchParams);
  const page = readPage(searchParams);

  const projects = await projectService.list({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    ...buildListParams(filters),
  });

  // The API returns a bare array, so a full page is the only next-page hint.
  return { projects, page, hasNextPage: projects.length === PAGE_SIZE };
}

export default function ProjectPage() {
  const { projects, page, hasNextPage } = useLoaderData<typeof ProjectLoader>();
  const [filters, setFilters] = useState<ProjectFilters>(EMPTY_FILTERS);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL is the source of truth for category/sub_category deep links; the
  // rest of the filters stay user-managed state.
  const urlFilters = useMemo(() => filtersFromUrl(searchParams), [searchParams]);

  // Snapshot of the filters behind the currently displayed results.
  const [appliedFilters, setAppliedFilters] =
    useState<ProjectFilters>(urlFilters);

  // URL deep links re-apply immediately; adjust during render instead of in an effect.
  const [lastUrlFilters, setLastUrlFilters] = useState(urlFilters);

  if (urlFilters !== lastUrlFilters) {
    setLastUrlFilters(urlFilters);
    setAppliedFilters(urlFilters);
  }

  const currentFilters: ProjectFilters = {
    ...filters,
    category: urlFilters.category,
    sub_category: urlFilters.sub_category,
  };

  // Only pending when the standby filters would query something different.
  const hasPendingFilters: boolean =
    JSON.stringify(buildListParams(currentFilters)) !==
    JSON.stringify(buildListParams(appliedFilters));

  const handleSearch = (): void => {
    const query = buildFilterQuery(currentFilters);

    navigate(query ? `/project?${query}` : "/project");
  };

  // Pagination lives in the URL so pages stay shareable and back/forward works.
  const goToPage = (nextPage: number): void => {
    const params = new URLSearchParams(searchParams);

    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));

    const query = params.toString();

    navigate(query ? `/project?${query}` : "/project");
  };

  // Filter edits stay on standby in local state; only "Pesquisar" applies them.
  const handleFilterChange = (next: ProjectFilters): void => {
    setFilters({
      ...next,
      category: urlFilters.category,
      sub_category: urlFilters.sub_category,
    });
  };

  return (
    <>
      <section className="mx-auto w-full px-2 py-4 lg:px-6 lg:py-8">
        <form
          className="relative mx-auto max-h-fit"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Input
            icon="search"
            label=""
            name="searchQuery"
            inputType="text"
            placeholder="Busque por novos projetos ou usuarios..."
            value={currentFilters.q}
            onChange={(e) =>
              handleFilterChange({ ...currentFilters, q: e.target.value })
            }
          />
          <div className="absolute right-2 top-8 -translate-y-1/2 flex gap-2">
            {hasPendingFilters && (
              <Button
                className="self-center px-3 py-1 text-xs"
                dataTestId="pending-filters-indicator"
                onClick={handleSearch}
                label="Filtros não aplicados"
              />
            )}
            <Button label="Pesquisar" buttonType="submit" />
          </div>

          <SearchFiltersLayout
            value={currentFilters}
            onChange={handleFilterChange}
          />
        </form>
      </section>

      <section className="mx-auto w-full px-2 lg:px-6">
        <ActiveFiltersBanner filters={urlFilters} />

        <div className="mb-5 mt-5">
          <div className="flex justify-between items-center">
            <h2 className="gb-heading text-2xl tracking-tight">
              <span className="text-(--gb-accent) text-3xl">*</span> Highlights desta semana
            </h2>
          </div>
          <div className="mt-2 h-[3px] bg-(--primary) border-0" />
        </div>

        <div className="grid grid-cols-5 grid-rows-4 gap-4">
          {projects.length ? (
            projects.map((project) => (
              <ProjectPreview
                key={project.id}
                item={project.id}
                title={project.title}
                category={project.category}
                deadline={
                  project.deadline
                    ? String(project.deadline).slice(0, 10)
                    : (project.completedAt ?? "")
                }
                problem={project.problem ?? ""}
                actions={project.user_actions ?? ""}
                audience={project.audience}
                programming_language={project.primaryLanguage}
                platforms={project.platforms}
                status={project.status}
                maxBudget={project.maxBudget}
                minBudget={project.minBudget}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="gb-label text-(--gb-stone-400)">NENHUM PROJETO ENCONTRADO.</p>
            </div>
          )}
        </div>

        <nav aria-label="Paginação de projetos" className="mt-6 flex items-center justify-center gap-4">
          <Button
            label="Anterior"
            buttonType="button"
            colorType="secondary"
            dataTestId="projects-prev-page"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          />

          <span className="gb-label text-(--gb-stone-600)" data-testid="projects-page-label">PÁGINA {page}</span>

          <Button
            label="Próxima"
            buttonType="button"
            colorType="primary"
            dataTestId="projects-next-page"
            disabled={!hasNextPage}
            onClick={() => goToPage(page + 1)}
          />
        </nav>
      </section>
    </>
  );
}
